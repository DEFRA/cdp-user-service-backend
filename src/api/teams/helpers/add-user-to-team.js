async function addUserToTeam(graphClient, mongoClient, db, userId, teamId) {
  const session = mongoClient.startSession()
  session.startTransaction()
  try {
    await graphClient
      .api(`/groups/${teamId}/members/$ref`)
      .post({ '@odata.id': `https://graph.microsoft.com/v1.0/users/${userId}` })

    await db
      .collection('users')
      .updateOne({ _id: userId }, { $addToSet: { teams: teamId } })

    const updatedTeam = await db
      .collection('teams')
      .findOneAndUpdate(
        { _id: teamId },
        { $addToSet: { users: userId } },
        { returnDocument: 'after' }
      )

    await session.commitTransaction()
    return updatedTeam
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}

export { addUserToTeam }
