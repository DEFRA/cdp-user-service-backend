import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { updateTeamValidationSchema } from '~/src/api/teams/helpers/update-team-validation-schema'
import { updateTeam } from '~/src/api/teams/helpers/update-team'
import { buildUpdateFields } from '~/src/helpers/build-update-fields'
import { aadGroupNameExists } from '~/src/api/teams/helpers/aad-group-name-exists'
import { aadGroupIdExists } from '~/src/api/teams/helpers/aad-group-id-exists'

const updateTeamController = {
  options: {
    validate: {
      payload: updateTeamValidationSchema
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const updateFields = buildUpdateFields(request?.payload, [
      'name',
      'description',
      'github'
    ])

    const groupIdExists = await aadGroupIdExists(request.msGraph, teamId)
    if (!groupIdExists) {
      throw Boom.notFound('Team not found')
    }

    if (updateFields.name) {
      const teamExists = await aadGroupNameExists(
        request.msGraph,
        updateFields.name
      )

      if (teamExists && teamExists?.id !== teamId) {
        throw Boom.conflict('Team already exists on AAD')
      }
    }

    const team = await updateTeam(
      request.msGraph,
      request.db,
      teamId,
      updateFields
    )
    if (isNull(team)) {
      throw Boom.notFound('Team not found')
    }
    return h.response({ message: 'success', team }).code(200)
  }
}

export { updateTeamController }
