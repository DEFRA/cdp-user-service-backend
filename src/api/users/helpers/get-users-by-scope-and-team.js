import { userAggregation } from './aggregations/user.js'
import { maybeObjectId } from '../../../helpers/maybe-objectid.js'

function getUsersByScopeAndTeam(db, scopeId, teamId) {
  const pipeline = [
    ...userAggregation,
    {
      $match: {
        scopes: {
          $elemMatch: {
            teamId,
            scopeId: maybeObjectId(scopeId)
          }
        }
      }
    }
  ]

  return db.collection('users').aggregate(pipeline).toArray()
}

export { getUsersByScopeAndTeam }
