import Boom from '@hapi/boom'

import { updateTeamValidationSchema } from '../helpers/update-team-validation-schema.js'
import { getTeam } from '../helpers/get-team.js'
import { getTeamsCount } from '../helpers/get-teams.js'
import { buildUpdateFields } from '../../../helpers/build-update-fields.js'
import { teamNameExists } from '../helpers/team-name-exists.js'
import { gitHubTeamExists } from '../helpers/github/github-team-exists.js'
import { updateTeam } from '../helpers/update-team.js'
import {
  addSharedRepoAccess,
  deleteSharedRepoAccess
} from '../helpers/github/github-shared-repo-access.js'
import { scopes, statusCodes } from '@defra/cdp-validation-kit'

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
    await updateGithubSharedRepos(
      existingTeam?.github,
      updateFields?.$set?.github,
      request
    )
    const updatedTeam = await updateTeam(request.db, teamId, updateFields)
    return h.response(updatedTeam).code(statusCodes.ok)
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
