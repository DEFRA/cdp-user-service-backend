import { teamWithUserAggregation } from './aggregations/team-with-users.js'
import { activePermissionFilter } from '../../permissions/helpers/relationships/active-permission-filter.js'

async function getTeam(db, teamId) {
  const teams = await db
    .collection('teams')
    .aggregate([{ $match: { _id: teamId } }, ...teamWithUserAggregation])
    .toArray()
  const team = teams?.at(0) ?? null

  if (!team) {
    return null
  }
  // enrich team users with break glass status.
  const usersWithBreakGlass = new Set(
    (
      await db
        .collection('relationships')
        .find({
          relation: 'breakGlass',
          resource: teamId,
          resourceType: 'team',
          ...activePermissionFilter()
        })
        .project({ _id: 0, subject: 1 })
        .toArray()
    ).map((u) => u.subject)
  )

  team.users.forEach((user) => {
    if (usersWithBreakGlass.has(user.userId)) {
      user.hasBreakGlass = true
    }
  })

  return team
}

export { getTeam }
