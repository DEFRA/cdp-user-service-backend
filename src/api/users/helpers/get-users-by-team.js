import { userWithTeamsAggregation } from './aggregations/user-with-teams.js'
import { findMembersOfTeam } from '../../permissions/helpers/relationships/relationships.js'

async function getUsersByTeam(db, teamId) {
  const members = await findMembersOfTeam(db, teamId)
  const pipeline = [
    {
      $match: { _id: { $in: members } }
    },
    ...userWithTeamsAggregation()
  ]

  return db.collection('users').aggregate(pipeline).toArray()
}

export { getUsersByTeam }
