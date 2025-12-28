async function deleteUser(db, userId) {
  return db.collection('users').deleteOne({ _id: userId })
}

export { deleteUser }
