async function createUser(db, dbUser) {
  return await db.collection('users').insertOne(dbUser)
}

export { createUser }
