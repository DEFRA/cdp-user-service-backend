import { isNil } from 'lodash'

async function teamNameExists(db, name) {
  const team = await db.collection('teams').findOne({ name })
  return !isNil(team)
}

export { teamNameExists }
