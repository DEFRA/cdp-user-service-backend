import { getTeam } from '~/src/api/teams/helpers/get-team'

async function removeUserFromTeam(
  graphClient,
  mongoClient,
  db,
  userId,
  teamId
) {
  const session = mongoClient.startSession()
  session.startTransaction()
  try {
    await graphClient.api(`/groups/${teamId}/members/${userId}/$ref`).delete()

    await db
      .collection('users')
      .updateOne({ _id: userId }, { $pull: { teams: teamId } })

    await db
      .collection('teams')
      .findOneAndUpdate({ _id: teamId }, { $pull: { users: userId } })

    await session.commitTransaction()
    return await getTeam(db, teamId)
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}

export { removeUserFromTeam }
