async function getUsers(db) {
  const cursor = db.collection('users').find({}, { projection: { _id: 0 } })
  return await cursor.toArray()
}

export { getUsers }
