import { teamWithUserAggregation } from './aggregations/team-with-users.js'

async function getTeam(db, teamId) {
  const teams = await db
    .collection('teams')
    .aggregate([{ $match: { _id: teamId } }, ...teamWithUserAggregation])
    .toArray()
  return teams?.at(0) ?? null
}

export { getTeam }
