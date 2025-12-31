async function deleteUser(db, userId) {
  const result = await db.collection('users').deleteOne({ _id: userId })
  return result.deletedCount === 1
}

export { deleteUser }
