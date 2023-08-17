function teamHasUser(dbTeam, dbUser) {
  const hasUser = dbTeam.users?.some((user) => user._id === dbUser._id) || false
  const hasTeam = dbUser.teams?.some((team) => team._id === dbTeam._id) || false
  return hasUser && hasTeam
}

export { teamHasUser }
