async function deleteTeam(db, teamId) {
  return db.collection('teams').deleteOne({ _id: teamId })
}

export { deleteTeam }
