import { userWithTeamsAggregation } from './aggregations/user-with-teams.js'

function getUsersByScopeAndTeam(db, scopeId, teamId) {
  const pipeline = [
    ...userWithTeamsAggregation(),
    {
      $match: {
        scopes: {
          $elemMatch: {
            scopeId: `${scopeId}:team:${teamId}`
          }
        }
      }
    }
  ]

  return db.collection('users').aggregate(pipeline).toArray()
}

export { getUsersByScopeAndTeam }
