import { groupNameFromTeamName } from '~/src/api/teams/helpers/group-name-from-team-name'

async function aadGroupNameExists(graphClient, name) {
  const groupName = groupNameFromTeamName(name)
  const group = await graphClient
    .api('/groups')
    .filter(`displayName eq '${groupName}'`)
    .get()

  return group.value?.at(0) ?? false
}

export { aadGroupNameExists }
