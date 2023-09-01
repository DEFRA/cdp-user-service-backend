import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { updateTeamValidationSchema } from '~/src/api/teams/helpers/update-team-validation-schema'
import { updateTeam } from '~/src/api/teams/helpers/update-team'
import { buildUpdateFields } from '~/src/helpers/build-update-fields'
import { aadGroupNameExists } from '~/src/api/teams/helpers/aad-group-name-exists'
import { aadGroupIdExists } from '~/src/api/teams/helpers/aad-group-id-exists'
import { getTeam } from '~/src/api/teams/helpers/get-team'

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
    if (updateFields.name) {
      const teamExists = await aadGroupNameExists(
        request.msGraph,
        updateFields.name
      )
      if (teamExists) {
        throw Boom.conflict('Team already exists in AAD')
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
