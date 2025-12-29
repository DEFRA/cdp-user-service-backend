import { teamWithUserAggregation } from './aggregations/team-with-users.js'

const now = new Date()
const activeWindow = {
  $and: [
    {
      $or: [
        { start: { $lte: now } },
        { start: null },
        { start: { $exists: false } }
      ]
    },
    {
      $or: [{ end: { $gte: now } }, { end: null }, { end: { $exists: false } }]
    }
  ]
}

async function getTeam(db, teamId) {
  const teams = await db
    .collection('teams')
    .aggregate([{ $match: { _id: teamId } }, ...teamWithUserAggregation])
    .toArray()
  const team = teams?.at(0) ?? null

  if (!team) {
    return null
  }
  // enrich team users with breakglass status.
  const usersWithBreakglass = await db
    .collection('relationships')
    .find({
      relation: 'breakGlass',
      resource: teamId,
      resourceType: 'team',
      ...activeWindow
    })
    .project({ _id: 0, subject: 1 })
    .toArray()

  usersWithBreakglass.forEach((user) => {
    const idx = team.users.findIndex((u) => u.userId === user.subject)
    if (idx > -1) {
      team.users[idx].hasBreakGlass = true
    }
  })

  return team
}

export { getTeam }
