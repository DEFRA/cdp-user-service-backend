import isNil from 'lodash/isNil.js'
import { userWithTeamsAggregation } from './aggregations/user-with-teams.js'

async function getUsers(db, query) {
  const stages = []

  if (!isNil(query)) {
    stages.push({
      $match: {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }
    })
  }

  stages.push(...userWithTeamsAggregation, {
    $sort: { name: 1 }
  })

  return await db.collection('users').aggregate(stages).toArray()
}

export { getUsers }
