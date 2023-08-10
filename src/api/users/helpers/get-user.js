async function getUser(db, userId) {
  return await db.collection('users').findOne({ _id: userId })
}

export { getUser }
