import { UTCDate } from '@date-fns/utc'

import { getUser } from './get-user.js'
import { removeNil } from '../../../helpers/remove-nil.js'

/**
 *
 * @param {{}} db
 * @param { _id: string, name: string, email: string|null, github: string|null } dbUser
 * @returns {Promise<*|null>}
 */
async function createUser(db, dbUser) {
  const utcDateNow = new UTCDate()
  const newUser = {
    ...removeNil(dbUser),
    createdAt: utcDateNow,
    updatedAt: utcDateNow
  }
  const insertResult = await db
    .collection('users')
    .insertOne(removeNil(newUser))
  return await getUser(db, insertResult.insertedId)
}

export { createUser }
