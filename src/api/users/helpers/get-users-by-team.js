import { userAggregation } from './aggregations/user.js'

async function getUsersByTeam(db, teamId) {
  const pipeline = [
    ...userAggregation(),
    {
      $match: {
        'teams.teamId': teamId
      }
    }
  ]

  return await db.collection('users').aggregate(pipeline).toArray()
}

export { getUsersByTeam }
