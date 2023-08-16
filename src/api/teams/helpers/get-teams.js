async function getTeams(db) {
  const cursor = db.collection('teams').find({})
  return await cursor.toArray()
}

export { getTeams }
