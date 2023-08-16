async function removeUserFromTeam(mongoClient, db, userId, teamId) {
  const session = mongoClient.startSession()
  session.startTransaction()
  try {
    await db
      .collection('users')
      .updateOne({ _id: userId }, { $pull: { teams: teamId } })

    const updatedTeam = await db
      .collection('teams')
      .findOneAndUpdate(
        { _id: teamId },
        { $pull: { users: userId } },
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

export { removeUserFromTeam }
