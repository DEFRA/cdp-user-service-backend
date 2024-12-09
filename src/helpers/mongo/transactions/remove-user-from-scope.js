import { ObjectId } from 'mongodb'

async function removeUserFromScope(request, userId, scopeId) {
  const db = request.db
  return await db
    .collection('scopes')
    .findOneAndUpdate(
      { _id: ObjectId.createFromHexString(scopeId) },
      { $pull: { users: userId }, $set: { updatedAt: new Date() } }
    )
}

export { removeUserFromScope }
