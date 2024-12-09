import Boom from '@hapi/boom'

import { config } from '~/src/config/config.js'
import { updateTeamValidationSchema } from '~/src/api/teams/helpers/update-team-validation-schema.js'
import { getTeam } from '~/src/api/teams/helpers/get-team.js'
import { getTeamsCount } from '~/src/api/teams/helpers/get-teams.js'
import { buildUpdateFields } from '~/src/helpers/build-update-fields.js'
import { teamNameExists } from '~/src/api/teams/helpers/team-name-exists.js'
import { aadGroupIdExists } from '~/src/api/teams/helpers/aad/aad-group-id-exists.js'
import { gitHubTeamExists } from '~/src/api/teams/helpers/github/github-team-exists.js'
import { updateTeam } from '~/src/api/teams/helpers/update-team.js'
import {
  addSharedRepoAccess,
  deleteSharedRepoAccess
} from '~/src/api/teams/helpers/github/github-shared-repo-access.js'

const updateTeamController = {
  options: {
    tags: ['api', 'teams'],
    validate: {
      payload: updateTeamValidationSchema
    },
    auth: {
      strategy: 'azure-oidc',
      access: {
        scope: [config.get('oidcAdminGroupId'), '{params.teamId}']
      }
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const existingTeam = await getTeam(request.db, teamId)
    if (!existingTeam) {
      throw Boom.notFound('Team not found in DB')
    }

    const groupIdExists = await aadGroupIdExists(request.msGraph, teamId)
    if (!groupIdExists) {
      throw Boom.notFound('Team not found in AAD')
    }

    const updateFields = buildUpdateFields(existingTeam, request?.payload, [
      'name',
      'description',
      'github',
      'serviceCodes',
      'alertEmailAddresses'
    ])
    await existingTeamInDb(updateFields?.$set?.name, request)
    await updateGithubSharedRepos(
      existingTeam?.github,
      updateFields?.$set?.github,
      request
    )
    const updatedTeam = await updateTeam(
      request.msGraph,
      request.db,
      teamId,
      updateFields
    )
    return h.response({ message: 'success', team: updatedTeam }).code(200)
  }
}

async function existingTeamInDb(name, request) {
  if (name) {
    const teamExists = await teamNameExists(request.db, name)
    if (teamExists) {
      throw Boom.conflict('Team already exists')
    }
  }
}

async function updateGithubSharedRepos(currentTeam, newTeam, request) {
  if (newTeam) {
    const gitHubExists = await gitHubTeamExists(request.octokit, newTeam)
    if (!gitHubExists) {
      throw Boom.badData('Team does not exist in GitHub')
    }
    // This is still experimental, so we're just going to log the error from this bit for now.
    if (currentTeam) {
      const numberOfTeamsInDb = await getTeamsCount(request.db, {
        github: currentTeam
      })

      if (numberOfTeamsInDb === 1) {
        try {
          await deleteSharedRepoAccess(request.octokit, currentTeam)
        } catch (error) {
          request.logger.error(
            `Failed to delete ${currentTeam} to the shared repos: ${error}`
          )
        }
      }
    }

    try {
      await addSharedRepoAccess(request.octokit, newTeam)
    } catch (error) {
      request.logger.error(
        `Failed to add ${newTeam} to the shared repos: ${error}`
      )
    }
  }
}

export { updateTeamController }
