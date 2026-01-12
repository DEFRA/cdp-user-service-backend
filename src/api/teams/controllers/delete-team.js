import Joi from 'joi'
import {
  teamIdValidation,
  scopes,
  statusCodes
} from '@defra/cdp-validation-kit'

import { triggerRemoveTeamWorkflow } from '../helpers/github/trigger-create-team-workflow.js'
import { deleteTeamRelationships } from '../../permissions/helpers/relationships/relationships.js'
import { deleteTeam } from '../helpers/delete-team.js'

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
      await triggerRemoveTeamWorkflow(request.octokit, {
        team_id: request.params.teamId
      })
    } catch (error) {
      request.logger.error(error, error.message)
      // Non-fatal for now...
    }

    await deleteTeam(request.db, request.params.teamId)
    await deleteTeamRelationships(request.db, request.params.teamId)
    return h.response().code(statusCodes.ok)
  }
}

export { deleteTeamController }
