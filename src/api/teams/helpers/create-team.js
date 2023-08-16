async function createTeam(db, dbTeam) {
  return await db.collection('teams').insertOne(dbTeam)
}

export { createTeam }
