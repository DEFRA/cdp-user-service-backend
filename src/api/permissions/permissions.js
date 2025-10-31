import Joi from 'joi'
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
          maxDepth: 5
        }
      }
    ])
    .toArray()

  const seen = new Set()
  const ids = new Set()

  for (const r of result) {
    ids.add(r.subject)
    ids.add(r.object)
    seen.add(`${r.subject} -->|${r.relation}| ${r.object}`)
    r.path.forEach((p) => {
      ids.add(p.subject)
      ids.add(p.object)
      seen.add(`${p.subject} -->|${p.relation}| ${p.object}`)
    })
  }

  console.log('subgraph team')
  ids.forEach((id) => {
    if (id.startsWith('team:')) console.log('    ' + id)
  })
  console.log('end')

  console.log('subgraph user')
  ids.forEach((id) => {
    if (id.startsWith('user:')) console.log('    ' + id)
  })
  console.log('end')

  console.log('subgraph perm')
  ids.forEach((id) => {
    if (id.startsWith('perm:')) console.log('    ' + id)
  })
  console.log('end')

  console.log('subgraph service')
  ids.forEach((id) => {
    if (id.startsWith('service:')) console.log('    ' + id)
  })
  console.log('end')

  seen.forEach((p) => {
    console.log(p.replaceAll('@', '_'))
  })

  return false
}

async function findMembersOfTeam(db, team) {
  const result = await db
    .collection(collection)
    .find({ object: team, relation: 'member' }, { subject: 1, _id: 0 })
    .toArray()

  return result.map((t) => t.subject)
}

async function backfill(db) {
  const users = await db.collection('users').find().toArray()
  const scopes = await db.collection('scopes').find().toArray()

  for (const user of users) {
    for (const team of user.teams) {
      await addRelationship(db, user._id, 'member', team)
    }
  }

  for (const scope of scopes) {
    for (const user of scope.users) {
      await addRelationship(db, user.userId, 'granted', scope.value)
    }

    for (const team of scope.teams) {
      await addRelationship(db, team.teamId, 'granted', scope.value)
    }

    for (const member of scope.members) {
      await addRelationship(db, member.userId, member.value, member.teamId)
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
  backfill
}
