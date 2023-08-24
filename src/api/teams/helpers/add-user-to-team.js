import { getTeam } from '~/src/api/teams/helpers/get-team'

async function addUserToTeam(msGraph, mongoClient, db, userId, teamId) {
  const session = mongoClient.startSession()
  session.startTransaction()
  try {
    await msGraph
      .api(`/groups/${teamId}/members/$ref`)
      .post({ '@odata.id': `https://graph.microsoft.com/v1.0/users/${userId}` })

    await db
      .collection('users')
      .updateOne({ _id: userId }, { $addToSet: { teams: teamId } })

    await db.collection('teams').findOneAndUpdate(
      { _id: teamId },
      {
        $addToSet: { users: userId },
        $set: { updatedAt: new Date() }
      }
    )

    await session.commitTransaction()
    return await getTeam(db, teamId)
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}

export { addUserToTeam }
