function teamHasUser(dbTeam, dbUser) {
  const hasUser = dbTeam.users?.some((user) => user._id === dbUser._id)
  const hasTeam = dbUser.teams?.some((team) => team._id === dbTeam._id)
  return hasUser && hasTeam
}

export { teamHasUser }
