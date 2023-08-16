async function updateTeam(db, teamId, updateFields) {
  return await db
    .collection('teams')
    .findOneAndUpdate(
      { _id: teamId },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
}

export { updateTeam }
