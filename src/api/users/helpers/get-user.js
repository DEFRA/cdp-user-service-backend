import { userAggregation } from '~/src/api/users/helpers/aggregations/user.js'

async function getUser(db, userId) {
  const users = await db
    .collection('users')
    .aggregate([{ $match: { _id: userId } }, ...userAggregation])
    .toArray()
  return users?.at(0) ?? null
}

export { getUser }
