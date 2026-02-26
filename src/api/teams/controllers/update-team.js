import Boom from '@hapi/boom'

import { getTeam } from '../helpers/get-team.js'
import { buildUpdateFields } from '../../../helpers/build-update-fields.js'
import { teamNameExists } from '../helpers/team-name-exists.js'
import { updateTeam } from '../helpers/update-team.js'
import { scopes, statusCodes } from '@defra/cdp-validation-kit'
import { triggerUpdateTeamWorkflow } from '../helpers/github/trigger-create-team-workflow.js'
import { updateTeamValidationSchema } from '../helpers/schemas.js'

const updateTeamController = {
  options: {
    validate: {
      payload: updateTeamValidationSchema
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin, 'team:{params.teamId}']
      }
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const existingTeam = await getTeam(request.db, teamId)
    if (!existingTeam) {
      throw Boom.notFound('Team not found in DB')
    }

    const updateFields = buildUpdateFields(existingTeam, request?.payload, [
      'name',
      'description',
      'github',
      'serviceCodes',
      'alertEmailAddresses',
      'alertEnvironments'
    ])
    await existingTeamInDb(updateFields?.$set?.name, request)
    const updatedTeam = await updateTeam(request.db, teamId, updateFields)

    await triggerUpdateTeamWorkflow(
      request.octokit,
      buildWorkflowInputs(teamId, request?.payload)
    )

    return h.response(updatedTeam).code(statusCodes.ok)
  }
}

function buildWorkflowInputs(teamId, payload) {
  const inputs = {
    team_id: teamId
  }

  if (payload.name) {
    inputs.name = payload.name
  }

  if (payload.description) {
    inputs.description = payload.description
  }

  if (payload.serviceCodes) {
    inputs.service_code = (payload.serviceCodes ?? [])[0]
  }

  if (payload.github) {
    inputs.github = payload.github
  }

  if (payload.slackChannels?.prod) {
    inputs.slack_prod = payload.slackChannels?.prod
  }

  if (payload.slackChannels?.nonProd) {
    inputs.slack_non_prod = payload.slackChannels?.nonProd
  }

  if (payload.slackChannels?.team) {
    inputs.slack_team = payload.slackChannels?.team
  }

  return inputs
}

async function existingTeamInDb(name, request) {
  if (name) {
    const teamExists = await teamNameExists(request.db, name)
    if (teamExists) {
      throw Boom.conflict('Team already exists')
    }
  }
}

export { updateTeamController }
