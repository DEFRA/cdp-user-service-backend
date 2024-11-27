import { ObjectId } from 'mongodb'

async function getScope(db, scopeId) {
  return await db.collection('scopes').findOne({ _id: new ObjectId(scopeId) })
}

export { getScope }
