import Boom from '@hapi/boom'

import { MongoErrors } from '../../../helpers/mongodb-errors.js'
import { teamNameExists } from '../helpers/team-name-exists.js'
import { createTeam, normalizeTeamName } from '../helpers/create-team.js'
import { scopes } from '@defra/cdp-validation-kit'
import { triggerGenericCdpCliWorkflow } from '../helpers/github/trigger-generic-cli-workflow.js'
import { createTeamValidationSchema } from '../helpers/schemas.js'
import {
  buildGenericCdpCommand,
  createTeamCommand,
  publishTeamCommand
} from '../helpers/github/generic-cdp-cli.js'

const createTeamController = {
  options: {
    validate: {
      payload: createTeamValidationSchema
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [scopes.admin]
      }
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const dbTeam = {
      name: payload.name,
      description: payload.description,
      github: payload.github,
      serviceCodes: payload.serviceCodes,
      alertEmailAddresses: payload.alertEmailAddresses,
      alertEnvironments: payload.alertEnvironments,
      slackChannels: payload.slackChannels,
      deliveryGroupId: payload.deliveryGroupId
    }
    const teamExists = await teamNameExists(request.db, dbTeam.name)
    if (teamExists) {
      throw Boom.conflict('Team already exists')
    }

    try {
      const triggerCreateTeamInputs = buildCreateWorkflowInputs(payload)
      const gitHubResponse = await triggerGenericCdpCliWorkflow(
        request.octokit,
        triggerCreateTeamInputs
      )
      request.logger.info(
        `create team workflow triggered: ${gitHubResponse?.html_url}`
      )
    } catch (error) {
      request.logger.error(error)
      // Non-fatal for now. Once we switch over to using cdp-tenant-config this will change.
    }

    try {
      const team = await createTeam(request.db, dbTeam)
      return h.response(team).code(201)
    } catch (error) {
      if (error.code === MongoErrors.DuplicateKey) {
        throw Boom.conflict('Team already exists')
      }
      throw error
    }
  }
}

function buildCreateWorkflowInputs(payload) {
  const createCommand = createTeamCommand({
    team_id: normalizeTeamName(payload.name),
    name: payload.name,
    description: payload.description,
    service_code: (payload.serviceCodes ?? [])[0],
    github: payload.github,
    slack_prod: payload.slackChannels?.prod,
    slack_non_prod: payload.slackChannels?.nonProd,
    slack_team: payload.slackChannels?.team,
    delivery_group_id: payload.deliveryGroupId
  })
  const publishCommand = publishTeamCommand()
  const runId = `Create Team ${payload.name}`
  return buildGenericCdpCommand(runId, [createCommand, publishCommand])
}

export { createTeamController }
