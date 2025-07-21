import { teamAggregation } from './aggregations/team.js'

async function getTeam(db, teamId) {
  const teams = await db
    .collection('teams')
    .aggregate([{ $match: { _id: teamId } }, ...teamAggregation])
    .toArray()
  return teams?.at(0) ?? null
}

export { getTeam }
