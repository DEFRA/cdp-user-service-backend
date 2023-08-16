async function updateTeam(db, teamId, updateFields) {
  const filter = { _id: teamId }
  const update = { $set: updateFields }
  const options = { returnDocument: 'after' }
  return await db.collection('teams').findOneAndUpdate(filter, update, options)
}

export { updateTeam }
