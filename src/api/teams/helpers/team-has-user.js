function teamHasUser(dbTeam, dbUser) {
  const hasUser = dbTeam.users?.some((user) => user.userId === dbUser.userId)
  const hasTeam = dbUser.teams?.some((team) => team.teamId === dbTeam.teamId)
  return hasUser && hasTeam
}

export { teamHasUser }
