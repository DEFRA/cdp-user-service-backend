import { config } from '~/src/config/config.js'

function groupNameFromTeamName(teamName) {
  const groupPrefix = config.get('azureGroupPrefix')
  return `${groupPrefix}${teamName.toUpperCase()}`
}

export { groupNameFromTeamName }
