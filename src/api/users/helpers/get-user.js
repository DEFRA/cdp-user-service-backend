async function getUser(db, userId) {
  return await db
    .collection('users')
    .findOne({ userId }, { projection: { _id: 0 } })
}

export { getUser }
