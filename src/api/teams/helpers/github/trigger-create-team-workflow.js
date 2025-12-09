import { config } from '../../../../config/config.js'

/**
 * Trigger https://github.com/DEFRA/cdp-tenant-config/blob/main/.github/workflows/create-team.yml
 * @param {{}} octokit
 * @param {{ team_id: string, name: string, description: string|null, service_code: string|null, github: string|null }} inputs
 * @returns {Promise<boolean>}
 */
async function triggerCreateTeamWorkflow(octokit, inputs) {
  const org = config.get('github.org')
  const repo = config.get('github.cdpTenantConfigRepo')
  const workflowId = config.get('github.createTeamWorkflow')

  return octokit.request(
    `POST /repos/{org}/{repo}/actions/workflows/{workflow_id}/dispatches`,
    {
      org,
      repo,
      workflow_id: workflowId,
      ref: 'main',
      inputs,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

/**
 * Trigger https://github.com/DEFRA/cdp-tenant-config/blob/main/.github/workflows/update-team.yml
 * @param {{}} octokit
 * @param {{ team_id: string, name: string|null, description: string|null, service_code: string|null, github: string|null }} inputs
 * @returns {Promise<boolean>}
 */
async function triggerUpdateTeamWorkflow(octokit, inputs) {
  const org = config.get('github.org')
  const repo = config.get('github.cdpTenantConfigRepo')
  const workflowId = config.get('github.updateTeamWorkflow')

  return octokit.request(
    `POST /repos/{org}/{repo}/actions/workflows/{workflow_id}/dispatches`,
    {
      org,
      repo,
      workflow_id: workflowId,
      ref: 'main',
      inputs,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

/**
 * Trigger https://github.com/DEFRA/cdp-tenant-config/blob/main/.github/workflows/remove-team.yml
 * Removes a team from the declarative config.
 * @param {{}} octokit
 * @param {{ team_id: string }} inputs
 * @returns {Promise<boolean>}
 */
async function triggerRemoveTeamWorkflow(octokit, inputs) {
  const org = config.get('github.org')
  const repo = config.get('github.cdpTenantConfigRepo')
  const workflowId = config.get('github.removeTeamWorkflow')

  return octokit.request(
    `POST /repos/{org}/{repo}/actions/workflows/{workflow_id}/dispatches`,
    {
      org,
      repo,
      workflow_id: workflowId,
      ref: 'main',
      inputs,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
}

export {
  triggerCreateTeamWorkflow,
  triggerUpdateTeamWorkflow,
  triggerRemoveTeamWorkflow
}
