import { groupNameFromTeamName } from '~/src/api/teams/helpers/group-name-from-team-name'

async function aadGroupNameExists(msGraph, name) {
  const groupName = groupNameFromTeamName(name)
  const group = await msGraph
    .api('/groups')
    .filter(`displayName eq '${groupName}'`)
    .get()

  return group?.value?.length > 0 ?? false
}

export { aadGroupNameExists }
