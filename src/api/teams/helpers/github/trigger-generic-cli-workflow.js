import { config } from '#config/config.js'

/**
 * Trigger https://github.com/DEFRA/cdp-tenant-config/blob/main/.github/workflows/generic-cdp-cli-workflow.yml
 * @param {{}} octokit
 * @param {{ run_id: string, commands: string }} inputs
 * @returns {Promise<boolean>}
 */
async function triggerGenericCdpCliWorkflow(octokit, inputs) {
  const org = config.get('github.org')
  const repo = config.get('github.cdpTenantConfigRepo')
  const workflowId = config.get('github.genericCdpCliWorkflow')

  return octokit.request(
    `POST /repos/{org}/{repo}/actions/workflows/{workflow_id}/dispatches`,
    {
      org,
      repo,
      workflow_id: workflowId,
      ref: 'main',
      inputs,
      headers: {
        'X-GitHub-Api-Version': '2026-03-10'
      }
    }
  )
}

export { triggerGenericCdpCliWorkflow }
