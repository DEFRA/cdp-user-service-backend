import { userAggregation } from './aggregations/user.js'
import { ObjectId } from 'mongodb'

async function getUsersByScopeAndTeam(db, scopeId, teamId) {
  const pipeline = [
    ...userAggregation(),
    {
      $match: {
        scopes: {
          $elemMatch: {
            teamId,
            scopeId: new ObjectId(scopeId)
          }
        }
      }
    }
  ]

  return await db.collection('users').aggregate(pipeline).toArray()
}

export { getUsersByScopeAndTeam }
