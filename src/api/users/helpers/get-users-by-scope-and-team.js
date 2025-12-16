import { userAggregation } from './aggregations/user.js'
function getUsersByScopeAndTeam(db, scopeId, teamId) {
  const pipeline = [
    ...userAggregation,
    {
      $match: {
        scopes: {
          $elemMatch: {
            teamId,
            scopeId
          }
        }
      }
    }
  ]

  return db.collection('users').aggregate(pipeline).toArray()
}

export { getUsersByScopeAndTeam }
