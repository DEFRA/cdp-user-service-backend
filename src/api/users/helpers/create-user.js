import { getUser } from '~/src/api/users/helpers/get-user'
import { removeNil } from '~/src/helpers/remove-nil'

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
