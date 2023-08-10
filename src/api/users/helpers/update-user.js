async function updateUser(db, userId, updateFields) {
  const filter = { _id: userId }
  const update = { $set: updateFields }
  const options = { returnDocument: 'after' }
  return await db.collection('users').findOneAndUpdate(filter, update, options)
}

export { updateUser }
