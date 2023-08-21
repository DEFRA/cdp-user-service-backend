import { normaliseUser } from '~/src/api/users/helpers/normalise-user'

// TODO this feels like its doing too much?
// TODO - setup teamId in the DB as a unique. Leave _id as is for Mongo, then this work can go
function normaliseTeam(team, nested = true) {
  const { _id, ...rest } = team
  const renamedTeam = { teamId: _id, ...rest }
  if (nested) {
    renamedTeam.users = renamedTeam.users
      ? renamedTeam.users.map((user) => normaliseUser(user, false))
      : []
  } else {
    renamedTeam.users = renamedTeam.users || []
  }
  return renamedTeam
}

export { normaliseTeam }
