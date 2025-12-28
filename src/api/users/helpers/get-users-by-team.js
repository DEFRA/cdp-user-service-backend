import { userWithTeamsAggregation } from './aggregations/user-with-teams.js'

function getUsersByTeam(db, teamId) {
  const pipeline = [
    ...userWithTeamsAggregation,
    {
      $match: {
        'teams.teamId': teamId
      }
    }
  ]

  return db.collection('users').aggregate(pipeline).toArray()
}

export { getUsersByTeam }
