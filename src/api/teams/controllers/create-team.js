import Boom from '@hapi/boom'

import { config } from '~/src/config'
import { createTeamValidationSchema } from '~/src/api/teams/helpers/create-team-validation-schema'
import { MongoErrors } from '~/src/helpers/mongodb-errors'
import { teamNameExists } from '~/src/api/teams/helpers/mongo/team-name-exists'
import { gitHubTeamExists } from '~/src/api/teams/helpers/github/github-team-exists'
import { createTeam } from '~/src/api/teams/helpers/aad/create-team'
import { addSharedRepoAccess } from '~/src/api/teams/helpers/github/github-shared-repo-access'

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

    await addGithubSharedRepos(payload?.github, request)

    try {
      const team = await createTeam(request.msGraph, request.db, dbTeam)

      return h.response({ message: 'success', team }).code(201)
    } catch (error) {
      if (error.code === MongoErrors.DuplicateKey) {
        throw Boom.conflict('Team already exists')
      }
      throw error
    }
  }
}

async function addGithubSharedRepos(team, request) {
  if (team) {
    const gitHubExists = await gitHubTeamExists(request.octokit, team)
    if (!gitHubExists) {
      throw Boom.badData('Team does not exist in GitHub')
    }

    // This is still experimental, so we're just going to log the error from this bit for now.
    try {
      await addSharedRepoAccess(request.octokit, team)
    } catch (error) {
      request.logger.error(
        `Failed to add ${team} to the shared repos: ${error}`
      )
    }
  }
}

export { createTeamController }
