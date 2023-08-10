async function getUsers(db) {
  const cursor = db.collection('users').find({})
  return await cursor.toArray()
}

export { getUsers }
