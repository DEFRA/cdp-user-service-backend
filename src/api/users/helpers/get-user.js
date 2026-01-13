import { userWithTeamsAggregation } from './aggregations/user-with-teams.js'

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

export { getUser, getUserOnly }
