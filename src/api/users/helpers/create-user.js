import { getUser } from '~/src/api/users/helpers/get-user'
import { removeNil } from '~/src/helpers/remove-nil'

async function createUser(db, dbUser) {
  const insertResult = await db.collection('users').insertOne(removeNil(dbUser))
  return await getUser(db, insertResult.insertedId)
}

export { createUser }
