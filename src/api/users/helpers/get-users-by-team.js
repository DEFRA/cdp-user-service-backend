import { userAggregation } from './aggregations/user.js'

function getUsersByTeam(db, teamId) {
  const pipeline = [
    ...userAggregation,
    {
      $match: {
        'teams.teamId': teamId
      }
    }
  ]

  return db.collection('users').aggregate(pipeline).toArray()
}

export { getUsersByTeam }
