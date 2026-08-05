import Joi from 'joi'
import {
  teamIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import { triggerGenericCdpCliWorkflow } from '../helpers/github/trigger-generic-cli-workflow.js'
import { deleteTeamRelationships } from '../../permissions/helpers/relationships/relationships.js'
import { deleteTeam } from '../helpers/delete-team.js'
import {
  buildGenericCdpCommand,
  publishTeamCommand,
  removeTeamCommand
} from '../helpers/github/generic-cdp-cli.js'

const deleteTeamController = {
  options: {
    validate: {
      params: Joi.object({
        teamId: teamIdValidation
      })
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    }
  },
  handler: async (request, h) => {
    try {
      const gitHubResponse = await triggerGenericCdpCliWorkflow(
        request.octokit,
        buildWorkflowInputs(request.params.teamId)
      )
      request.logger.info(
        `delete team workflow triggered: ${gitHubResponse?.html_url}`
      )
    } catch (error) {
      request.logger.error(error, error.message)
    }

    await deleteTeam(request.db, request.params.teamId)
    await deleteTeamRelationships(request.db, request.params.teamId)
    return h.response().code(statusCodes.ok)
  }
}

function buildWorkflowInputs(teamId) {
  const removeCommand = removeTeamCommand(teamId)
  const publishCommand = publishTeamCommand()
  const runId = crypto.randomUUID().toString()
  return buildGenericCdpCommand(runId, [removeCommand, publishCommand])
}
export { deleteTeamController }
