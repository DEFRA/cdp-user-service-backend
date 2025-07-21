import { getUser } from './get-user.js'
import { removeNil } from '../../../helpers/remove-nil.js'

async function createUser(db, dbUser) {
  const newUser = {
    ...removeNil(dbUser),
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const insertResult = await db
    .collection('users')
    .insertOne(removeNil(newUser))
  return await getUser(db, insertResult.insertedId)
}

export { createUser }
