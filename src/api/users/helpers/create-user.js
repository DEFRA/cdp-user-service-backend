import { getUser } from '~/src/api/users/helpers/get-user'

async function createUser(db, dbUser) {
  const insertResult = await db.collection('users').insertOne(dbUser)
  return await getUser(db, insertResult.insertedId)
}

export { createUser }
