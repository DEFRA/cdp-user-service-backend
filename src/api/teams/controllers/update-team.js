import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { updateTeamValidationSchema } from '~/src/api/teams/helpers/update-team-validation-schema'
import { getTeam } from '~/src/api/teams/helpers/get-team'
import { buildUpdateFields } from '~/src/helpers/build-update-fields'
import { teamNameExists } from '~/src/api/teams/helpers/team-name-exists'
import { aadGroupIdExists } from '~/src/api/teams/helpers/aad-group-id-exists'
import { gitHubTeamExists } from '~/src/api/teams/helpers/github-team-exists'
import { updateTeam } from '~/src/api/teams/helpers/update-team'

const updateTeamController = {
  options: {
    validate: {
      payload: updateTeamValidationSchema
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const existingTeam = await getTeam(request.db, teamId)
    if (isNull(existingTeam)) {
      throw Boom.notFound('Team not found in DB')
    }

    const groupIdExists = await aadGroupIdExists(request.msGraph, teamId)
    if (!groupIdExists) {
      throw Boom.notFound('Team not found in AAD')
    }

    const updateFields = buildUpdateFields(existingTeam, request?.payload, [
      'name',
      'description',
      'github'
    ])

    if (updateFields?.$set?.name) {
      const teamExists = await teamNameExists(
        request.db,
        updateFields.$set.name
      )
      if (teamExists) {
        throw Boom.conflict('Team already exists')
      }
    }

    if (updateFields?.$set?.github) {
      const gitHubExists = await gitHubTeamExists(
        request.octokit,
        updateFields.$set.github
      )
      if (!gitHubExists) {
        throw Boom.badData('Team does not exist in GitHub')
      }
    }

    const updatedTeam = await updateTeam(
      request.msGraph,
      request.db,
      teamId,
      updateFields
    )
    return h.response({ message: 'success', team: updatedTeam }).code(200)
  }
}

export { updateTeamController }
