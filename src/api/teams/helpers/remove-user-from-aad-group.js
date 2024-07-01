/**
 * User service could be out of sync with AAD.
 * To avoid aborting the parent operation guard against group and/or user no longer existing in AAD.
 *
 * @param msGraph
 * @param logger
 * @param teamId
 * @param userId
 * @returns {Promise<void>}
 */
async function removeUserFromAadGroup(msGraph, logger, teamId, userId) {
  try {
    const teamMembersResult = await msGraph
      .api(`/groups/${teamId}/members`)
      .get()
    const teamMembers = teamMembersResult?.value?.map((member) => member.id)

    if (teamMembers.includes(userId)) {
      await msGraph.api(`/groups/${teamId}/members/${userId}/$ref`).delete()
      logger.info(`User: ${userId} removed from AAD teamId: ${teamId}`)
    }
  } catch (error) {
    logger.error(
      { error },
      `User: ${userId} removal from AAD group:${teamId} failed due to: ${error.message}`
    )
  }
}

export { removeUserFromAadGroup }
