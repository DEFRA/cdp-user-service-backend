import Boom from '@hapi/boom'
import { updateTeam } from '~/src/api/teams/helpers/update-team'
import { normaliseTeam } from '~/src/api/teams/helpers/normalise-team'
import { buildUpdateFields } from '~/src/helpers/build-update-fields'
import { updateTeamValidationSchema } from '~/src/api/teams/helpers/update-team-validation-schema'

const updateTeamController = {
  options: {
    validate: {
      payload: updateTeamValidationSchema
    }
  },
  handler: async (request, h) => {
    const teamId = request.params.teamId
    const fields = ['name', 'description']
    const updateFields = buildUpdateFields(request?.payload, fields)
    const updateResult = await updateTeam(request.db, teamId, updateFields)
    if (updateResult.value) {
      const team = normaliseTeam(updateResult.value, false)
      return h.response({ message: 'success', team }).code(200)
    } else {
      return Boom.notFound()
    }
  }
}

export { updateTeamController }
