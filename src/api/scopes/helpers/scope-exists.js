import { ObjectId } from 'mongodb'

async function scopeExists(db, scopeId) {
  const scope = await db
    .collection('scopes')
    .findOne({ _id: ObjectId.createFromHexString(scopeId) })
  return scope !== null
}

export { scopeExists }
