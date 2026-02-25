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
      buildWorkflowPayload(teamId, request?.payload)
    )

    return h.response(updatedTeam).code(statusCodes.ok)
  }
}

function buildWorkflowPayload(teamId, update) {
  const payload = {
    team_id: teamId
  }

  if (update.name) {
    payload.name = update.name
  }

  if (update.description) {
    payload.description = update.description
  }

  if (update.serviceCodes) {
    payload.service_code = (update.serviceCodes ?? [])[0]
  }

  if (update.github) {
    payload.github = update.github
  }

  return payload
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
