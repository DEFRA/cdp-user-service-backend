function teamHasUser(dbTeam, dbUser) {
  const hasUser = dbTeam.users?.includes(dbUser._id)
  const hasTeam = dbUser.teams?.includes(dbTeam._id)
  return hasUser && hasTeam
}

export { teamHasUser }
