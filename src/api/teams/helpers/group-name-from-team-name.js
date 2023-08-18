import { appConfig } from '~/src/config'

function groupNameFromTeamName(teamName) {
  const groupPrefix = appConfig.get('azureGroupPrefix')
  return `${groupPrefix}${teamName.toUpperCase()}`
}

export { groupNameFromTeamName }
