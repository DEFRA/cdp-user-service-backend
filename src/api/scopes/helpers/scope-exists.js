import { maybeObjectId } from '../../../helpers/maybe-objectid.js'

async function scopeExists(db, scopeId) {
  const scope = await db
    .collection('scopes')
    .findOne({ _id: maybeObjectId(scopeId) })
  return scope !== null
}

export { scopeExists }
