import isNil from 'lodash/isNil.js'

async function teamNameExists(db, name) {
  const team = await db.collection('teams').findOne({ name })
  return !isNil(team)
}

export { teamNameExists }
