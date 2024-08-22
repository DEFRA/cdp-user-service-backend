import { config } from '~/src/config'

function groupNameFromTeamName(teamName) {
  const groupPrefix = config.azureGroupPrefix
  return `${groupPrefix}${teamName.toUpperCase()}`
}

export { groupNameFromTeamName }
