async function updateUser(db, userId, updateFields) {
  return await db
    .collection('users')
    .findOneAndUpdate(
      { _id: userId },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
}

export { updateUser }
