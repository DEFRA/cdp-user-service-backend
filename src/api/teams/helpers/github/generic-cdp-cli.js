/**
 * Builds a payload for the cdp-generic-cli workflow.
 * @param {string} runId
 * @param {string[]} commands
 * @return {{run_id: string, commands: string}}
 */
export function buildGenericCdpCommand(runId, commands) {
  return {
    run_id: runId,
    commands: JSON.stringify(commands)
  }
}

/**
 * Basic shell param escaping.
 * @param {string} param
 * @return {string}
 */
function escapeShell(param) {
  if (param === '' || param === null || param === undefined) return "''"
  return `'${String(param).replace(/'/g, "'\\''")}'`
}

/**
 * Generates payload for the cdp-cli to create a new team.
 * @param {{ team_id: string, name: string, description: string|null, service_code: string|null, github: string|null, slack_prod: string|null, slack_non_prod: string|null, slack_team: string|null }} team
 * @returns {string}
 */
export function createTeamCommand(team) {
  const args = [
    'team add',
    `--team-id ${escapeShell(team.team_id)}`,
    `--team-name ${escapeShell(team.name)}`
  ]

  if (team.description) {
    args.push(`--description ${escapeShell(team.description)}`)
  }

  if (team.github) {
    args.push(`--github ${escapeShell(team.github)}`)
  }

  if (team.service_code) {
    args.push(`--service-code ${escapeShell(team.service_code)}`)
  }

  if (team.slack_prod) {
    args.push(`--slack-prod ${escapeShell(team.slack_prod)}`)
  }

  if (team.slack_non_prod) {
    args.push(`--slack-non-prod ${escapeShell(team.slack_prod)}`)
  }

  if (team.slack_team) {
    args.push(`--slack-team ${escapeShell(team.slack_prod)}`)
  }

  return args.join(' ')
}

/**
 * Generates payload for cdp-cli to update fields in a team.
 * @param {{ team_id: string, name: string, description: string|null, service_code: string|null, github: string|null, slack_prod: string|null, slack_non_prod: string|null, slack_team: string|null }} team
 * @returns {string}
 */
export function updateTeamCommand(team) {
  const args = ['team update', `--team-id ${escapeShell(team.team_id)}`]

  if (team.name) {
    args.push(`--team-name ${escapeShell(team.name)}`)
  }

  if (team.description) {
    args.push(`--description ${escapeShell(team.description)}`)
  }

  if (team.github) {
    args.push(`--github ${escapeShell(team.github)}`)
  }

  if (team.service_code) {
    args.push(`--service-code ${escapeShell(team.service_code)}`)
  }

  if (team.slack_prod) {
    args.push(`--slack-prod ${escapeShell(team.slack_prod)}`)
  }

  if (team.slack_non_prod) {
    args.push(`--slack-non-prod ${escapeShell(team.slack_prod)}`)
  }

  if (team.slack_team) {
    args.push(`--slack-team ${escapeShell(team.slack_prod)}`)
  }

  return args.join(' ')
}

/**
 * Generates payload for the cdp-cli re-publish the team data back to portal.
 * @return {string}
 */
export function publishTeamCommand() {
  return 'team publish'
}

/**
 * Generates payload for the cdp-cli to remove a team by id.
 * @param {string} teamId
 * @return {string}
 */
export function removeTeamCommand(teamId) {
  const args = ['team remove', `--team-id ${escapeShell(teamId)}`]
  return args.join(' ')
}
