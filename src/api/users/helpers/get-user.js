import { userWithTeamsAggregation } from './aggregations/user-with-teams.js'
import { userAggregation } from './aggregations/user.js'

/**
 *
 * @param {{}} db
 * @param {string} userId
 * @returns {Promise<*|null>}
 */
async function getUser(db, userId) {
  const pipeline = [{ $match: { _id: userId } }, ...userWithTeamsAggregation()]
  const users = await db
    .collection('users', { readPreference: 'primary' })
    .aggregate(pipeline)
    .toArray()
  return users?.at(0) ?? null
}

async function getUserOnly(db, userId) {
  return db.collection('users').findOne({ _id: userId })
}

/**
 * This is only here to support the permission comparison endpoint to check
 * the new perms match the old ones.
 * @param {{}} db
 * @param {string} userId
 * @returns {Promise<*|null>}
 */
async function originalGetUser(db, userId) {
  const users = await db
    .collection('users')
    .aggregate([{ $match: { _id: userId } }, ...userAggregation])
    .toArray()
  return users?.at(0) ?? null
}

export { getUser, originalGetUser, getUserOnly }
