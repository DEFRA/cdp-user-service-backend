import { scopeDefinitions } from '../../../config/scopes.js'
import { activePermissionFilter } from '../../permissions/helpers/relationships/active-permission-filter.js'

async function getScope(db, scopeId) {
  const scope = scopeDefinitions[scopeId]

  if (!scope) {
    return null
  }

  const grantees = await db
    .collection('relationships')
    .find({
      relation: 'granted',
      resource: scopeId,
      resourceType: 'permission'
    })
    .toArray()

  const memberGrantees = await db
    .collection('relationships')
    .aggregate([
      {
        $match: {
          relation: scopeId,
          subjectType: 'user',
          ...activePermissionFilter()
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'subject',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ])
    .toArray()

  const teamIds = new Set(
    grantees.filter((g) => g.subjectType === 'team').map((g) => g.subject)
  )
  const userIds = new Set(
    grantees.filter((g) => g.subjectType === 'user').map((g) => g.subject)
  )

  const teams = await db
    .collection('teams')
    .find({ _id: { $in: [...teamIds] } })
    .project({ _id: 0, teamId: '$_id', teamName: '$name' })
    .toArray()

  const users = await db
    .collection('users')
    .find({ _id: { $in: [...userIds] } })
    .project({ _id: 0, userId: '$_id', userName: '$name' })
    .toArray()

  const members = memberGrantees.map((g) => ({
    userId: g.subject,
    userName: g.user.name,
    teamId: g.resource,
    teamName: g.resource
  }))

  return {
    ...scope,
    teams,
    users,
    members
  }
}

export { getScope }
