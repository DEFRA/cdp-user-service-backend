async function getTeam(db, teamId) {
  return await db.collection('teams').findOne({ _id: teamId })
}

export { getTeam }
