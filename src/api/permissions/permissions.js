import Joi from 'joi'
import { scopes } from '@defra/cdp-validation-kit'
const collection = 'relationships'

const ruleLaunchTerminal = {
  name: 'service:terminal',
  context: Joi.object({
    service: Joi.string().required(),
    team: Joi.string().required(),
    environment: Joi.string().required()
  }),
  rules: (ctx) => [
    {
      and: [
        isAdmin,
        {
          relation: 'breakglass',
          object: `team:admin`,
          if: ctx.environment === 'prod',
          desc: 'Must have break-glass for admin'
        }
      ]
    },
    {
      and: [
        { relation: 'owns', object: ctx.service, desc: 'must own service' },
        {
          // for production, path to service must run via a break-glass relationship as well
          // user:id -->|breakglass| team:id -->|owns| service:id
          path: ['breakglass', 'owns', 'team:admin'],
          object: `service:${ctx.service}`,
          if: ctx.environment === 'prod',
          desc: 'Must have break-glass for team'
        }
      ]
    }
  ]
}

const codePolicy = {
  name: 'deploy-service',
  apply: async function (ctx) {
    const user = 'user:' + ctx.user
    const team = 'team:' + ctx.team
    const env = ctd.environment

    const isAdmin = await checkPathAny(ctx.db, user, 'permission:admin')
    if (isAdmin) {
      return {
        allow: true,
        reason: 'is admin'
      }
    }

    if (env === 'management' || env === 'infra-dev') {
      return {
        allow: false,
        reason: 'only admins can deploy to this env'
      }
    }

    if (env === 'ext-test') {
      const hasExtTestPermission = await checkPathAny(
        ctx.db,
        user,
        'permission:ext-test'
      )

      if (!hasExtTestPermission) {
        return {
          allow: false,
          reason: 'user requires ext-test permission'
        }
      }
    }

    const isMember = await checkDirect(ctx.db, user, {
      relation: 'member',
      object: team
    })

    if (isMember) {
      return {
        allow: true,
        reason: 'user is member of team'
      }
    }

    return {
      allow: false,
      reason: 'user does not own this service'
    }
  }
}

async function createIndexes(db) {
  await db.collection(collection).createIndex({ subject: 1, object: 1 })
}

async function addRelationship(db, subject, relation, object) {
  await db.collection(collection).insertOne({ subject, relation, object })

  // { "subject": "user:alice", "relation": "member", "object": "team:7" }
  // { "subject": "team:7", "relation": "owner", "object": "service:123" }
  // { "subject": "user:alice", "relation": "has_perm", "object": "prod" }
}

async function removeRelationship(db, relationship) {
  await db.collection(collection).deleteOne(relationship)
}

/**
 *
 * @param {{}} db
 * @param { string } subject
 * @param {{ relation: string, object: string }} cond
 * @returns {Promise<boolean>}
 */
async function checkDirect(db, subject, cond) {
  return !!(await db.collection(collection).findOne({
    subject,
    relation: cond.relation,
    object: cond.object
  }))
}

async function checkPathExact(db, subject, target, path) {
  let current = [subject]
  for (const rel of path) {
    const next = await db
      .collection(collection)
      .find({ subject: { $in: current }, relation: rel })
      .map((r) => r.object)
      .toArray()

    if (next.length === 0) return false

    current = next
  }
  return current.includes(target)
}

async function checkPathAny(db, subject, target, terminalRel) {
  const result = await db
    .collection(collection)
    .aggregate([
      { $match: { subject } },
      {
        $graphLookup: {
          from: collection,
          startWith: '$object',
          connectFromField: 'object',
          connectToField: 'subject',
          as: 'path',
          maxDepth: 5
        }
      }
    ])
    .toArray()

  for (const start of result) {
    const rels = [start.relation, ...start.path.map((p) => p.relation)]
    const objs = [start.object, ...start.path.map((p) => p.object)]

    // terminalRel must appear and line up with the target
    for (let i = 0; i < rels.length; i++) {
      if (rels[i] === terminalRel && objs[i] === target) {
        return true
      }
    }
  }
  return false
}

async function getPerms(db, userId) {
  const result = await db
    .collection(collection)
    .aggregate([
      {
        $match: {
          subject: `user:${userId}`,
          $or: [{ end: { $gt: new Date() } }, { end: null }]
        }
      },
      {
        $graphLookup: {
          from: collection,
          startWith: '$object',
          connectFromField: 'object',
          connectToField: 'subject',
          as: 'path',
          maxDepth: 5,
          restrictSearchWithMatch: {
            $and: [
              { $or: [{ start: { $gte: new Date() } }, { start: null }] },
              { $or: [{ end: { $gt: new Date() } }, { end: null }] }
            ]
          }
        }
      }
    ])
    .toArray()

  const perms = new Set()
  perms.add(`user:${userId}`)

  const scopeFlags = {
    isAdmin: false,
    isTenant: false,
    hasBreakGlass: false
  }

  for (const r of result) {
    if (r.relation === 'breakglass') {
      perms.add(`${scopes.breakGlass}:${r.object}`)
      scopeFlags.hasBreakGlass = true
    }

    perms.add(r.object)
    if (r.relation === 'member') {
      scopeFlags.isTenant = true
    }

    r.path.forEach((p) => {
      perms.add(p.object)
    })
  }

  scopeFlags.isAdmin = perms.has('permission:admin')

  return {
    scopes: Array.from(perms).sort((a, b) => a.localeCompare(b)),
    scopeFlags
  }
}

async function drawPerms(db, subject) {
  const result = await db
    .collection(collection)
    .aggregate([
      {
        $match: { subject }
      },
      {
        $graphLookup: {
          from: collection,
          startWith: '$object',
          connectFromField: 'object',
          connectToField: 'subject',
          as: 'path',
          maxDepth: 5,
          restrictSearchWithMatch: {
            $and: [
              { $or: [{ start: { $gte: new Date() } }, { start: null }] },
              { $or: [{ end: { $gt: new Date() } }, { end: null }] }
            ]
          }
        }
      }
    ])
    .toArray()

  const seen = new Set()
  const ids = new Set()

  for (const r of result.filter(
    (r) => !r.object.startsWith('permission:serviceOwner:') // dupe of team:id
  )) {
    ids.add(r.subject)
    ids.add(r.object)
    seen.add(`${r.subject} -->|${r.relation}| ${r.object}`)
    r.path.forEach((p) => {
      ids.add(p.subject)
      ids.add(p.object)
      seen.add(`${p.subject} -->|${p.relation}| ${p.object}`)
    })
  }

  let mermaid = 'flowchart TD\n'
  mermaid += 'subgraph team\n'
  ids.forEach((id) => {
    if (id.startsWith('team:')) mermaid += '    ' + id + '\n'
  })
  mermaid += 'end\n'

  mermaid += 'subgraph user\n'
  ids.forEach((id) => {
    if (id.startsWith('user:')) mermaid += '    ' + id + '\n'
  })
  mermaid += 'end\n'

  mermaid += 'subgraph permissions\n'
  ids.forEach((id) => {
    if (id.startsWith('permission:')) mermaid += '    ' + id + '\n'
  })
  mermaid += 'end\n'

  /*mermaid += 'subgraph service\n'
  ids.forEach((id) => {
    if (id.startsWith('service:')) mermaid += '    ' + id + '\n'
  })
  mermaid += 'end\n'
*/
  seen.forEach((p) => {
    mermaid += p.replaceAll('@', '_') + '\n'
  })
  mermaid += '\n'

  return mermaid
}

async function findMembersOfTeam(db, team) {
  const result = await db
    .collection(collection)
    .find({ object: team, relation: 'member' }, { subject: 1, _id: 0 })
    .toArray()

  return result.map((t) => t.subject)
}

async function backfill(db) {
  await db.collection('relationships').drop()
  const users = await db.collection('users').find().toArray()
  const scopes = await db.collection('scopes').find().toArray()

  for (const user of users) {
    for (const team of user.teams) {
      await addRelationship(db, `user:${user._id}`, 'member', `team:${team}`)
      await addRelationship(
        db,
        `user:${user._id}`,
        'member',
        `permission:serviceOwner:team:${team}`
      )
    }
  }

  for (const scope of scopes) {
    for (const user of scope.users) {
      await addRelationship(
        db,
        `user:${user.userId}`,
        'granted',
        `permission:${scope.value}`
      )
    }

    for (const team of scope.teams) {
      await addRelationship(
        db,
        `team:${team.teamId}`,
        'granted',
        `permission:${scope.value}`
      )
    }

    for (const member of scope.members) {
      await addRelationship(
        db,
        `user:${member.userId}`,
        member.value,
        `team:${member.teamId}`
      )
    }
  }
}

export {
  addRelationship,
  checkDirect,
  checkPathAny,
  checkPathExact,
  findMembersOfTeam,
  createIndexes,
  drawPerms,
  backfill,
  getPerms
}
