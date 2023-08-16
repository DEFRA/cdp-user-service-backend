function normaliseTeam(team) {
  const { _id, ...rest } = team
  return { teamId: _id, ...rest }
}

export { normaliseTeam }
