import { userWithTeamsAggregation } from './aggregations/user-with-teams.js'
import { userAggregation } from './aggregations/user.js'

async function getUser(db, userId) {
  const users = await db
    .collection('users')
    .aggregate([{ $match: { _id: userId } }, ...userWithTeamsAggregation])
    .toArray()
  return users?.at(0) ?? null
}

async function originalGetUser(db, userId) {
  const users = await db
    .collection('users')
    .aggregate([{ $match: { _id: userId } }, ...userAggregation])
    .toArray()
  return users?.at(0) ?? null
}

export { getUser, originalGetUser }
