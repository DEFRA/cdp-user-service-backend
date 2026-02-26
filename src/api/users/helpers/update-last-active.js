function updateLastActive(db, userId) {
  return db
    .collection('users')
    .updateOne({ _id: userId }, { $currentDate: { lastActive: true } })
}

export { updateLastActive }
