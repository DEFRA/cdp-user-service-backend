import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { createTeamValidationSchema } from '~/src/api/teams/helpers/create-team-validation-schema'
import { MongoErrors } from '~/src/helpers/mongodb-errors'
import { teamNameExists } from '~/src/api/teams/helpers/team-name-exists'
import { gitHubTeamExists } from '~/src/api/teams/helpers/github-team-exists'
import { createTeam } from '~/src/api/teams/helpers/create-team'
import { updateSharedRepoAccess } from '~/src/api/teams/helpers/update-shared-repo-access'

const createTeamController = {
  options: {
    validate: {
      payload: createTeamValidationSchema
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId')]
      }
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const dbTeam = {
      name: payload.name,
      description: payload?.description,
      github: payload?.github
    }
    const teamExists = await teamNameExists(request.db, dbTeam.name)
    if (teamExists) {
      throw Boom.conflict('Team already exists')
    }

    if (payload?.github) {
      const gitHubExists = await gitHubTeamExists(
        request.octokit,
        payload.github
      )
      if (!gitHubExists) {
        throw Boom.badData('Team does not exist in GitHub')
      }
    }

    try {
      const team = await createTeam(request.msGraph, request.db, dbTeam)

      // This is still experimental, so we're just going to log the error from this bit for now.
      try {
        await updateSharedRepoAccess(request.octokit, payload.github)
      } catch (error) {
        request.logger.error(
          `Failed to add ${payload.github} to the shared repos: ${error}`
        )
      }

      return h.response({ message: 'success', team }).code(201)
    } catch (error) {
      if (error.code === MongoErrors.DuplicateKey) {
        throw Boom.conflict('Team already exists')
      }
      throw error
    }
  }
}

export { createTeamController }
