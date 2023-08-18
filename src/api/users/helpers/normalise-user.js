import { normaliseTeam } from '~/src/api/teams/helpers/normalise-team'

function normaliseUser(user, nested = true) {
  const { _id, ...rest } = user
  const renamedUser = { userId: _id, ...rest }
  if (nested) {
    renamedUser.teams = renamedUser.teams
      ? renamedUser.teams.map((team) => normaliseTeam(team, false))
      : []
  } else {
    renamedUser.teams = renamedUser.teams || []
  }
  return renamedUser
}

export { normaliseUser }
