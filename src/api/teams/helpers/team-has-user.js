function teamHasUser(dbTeam, dbUser) {
  const hasUser =
    dbTeam.users?.some((user) => user.userId === dbUser.userId) || false
  const hasTeam =
    dbUser.teams?.some((team) => team.teamId === dbTeam.teamId) || false
  return hasUser && hasTeam
}

export { teamHasUser }
