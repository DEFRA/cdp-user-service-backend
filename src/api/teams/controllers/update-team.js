import Boom from '@hapi/boom'

import { getTeam } from '../helpers/get-team.js'
import { buildUpdateFields } from '../../../helpers/build-update-fields.js'
import { teamNameExists } from '../helpers/team-name-exists.js'
import { updateTeam } from '../helpers/update-team.js'
import { scopes, statusCodes } from '@defra/cdp-validation-kit'
import { triggerGenericCdpCliWorkflow } from '../helpers/github/trigger-generic-cli-workflow.js'
import { updateTeamValidationSchema } from '../helpers/schemas.js'
import {
  buildGenericCdpCommand,
  publishTeamCommand,
  updateTeamCommand
} from '../helpers/github/generic-cdp-cli.js'

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
      'alertEnvironments',
      'deliveryGroupId'
    ])

    await existingTeamInDb(updateFields?.$set?.name, request)
    const updatedTeam = await updateTeam(request.db, teamId, updateFields)

    try {
      const gitHubResponse = await triggerGenericCdpCliWorkflow(
        request.octokit,
        buildWorkflowInputs(teamId, request?.payload)
      )
      request.logger.info(
        `update team workflow triggered: ${gitHubResponse?.html_url}`
      )
    } catch (error) {
      request.logger.error(error)
    }

    return h.response(updatedTeam).code(statusCodes.ok)
  }
}

function buildWorkflowInputs(teamId, payload) {
  const updateCommand = updateTeamCommand({
    team_id: teamId,
    name: payload.name,
    description: payload.description,
    service_code: (payload.serviceCodes ?? [])[0],
    github: payload.github,
    slack_prod: payload.slackChannels?.prod,
    slack_non_prod: payload.slackChannels?.nonProd,
    slack_team: payload.slackChannels?.team
  })
  const publishCommand = publishTeamCommand()
  const runId = crypto.randomUUID().toString()
  // if (payload.deliveryGroupId) {
  //   inputs.delivery_group_id = payload.deliveryGroupId
  // }

  return buildGenericCdpCommand(runId, [updateCommand, publishCommand])
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
