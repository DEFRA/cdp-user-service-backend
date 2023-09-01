import Boom from '@hapi/boom'

import { createTeamValidationSchema } from '~/src/api/teams/helpers/create-team-validation-schema'
import { MongoErrors } from '~/src/helpers/mongodb-errors'
import { aadGroupNameExists } from '~/src/api/teams/helpers/aad-group-name-exists'
import { gitHubTeamExists } from '~/src/api/teams/helpers/github-team-exists'
import { createTeam } from '~/src/api/teams/helpers/create-team'

const createTeamController = {
  options: {
    validate: {
      payload: createTeamValidationSchema
    }
  },
  handler: async (request, h) => {
    const payload = request?.payload
    const dbTeam = {
      name: payload.name,
      description: payload?.description,
      github: payload?.github
    }
    const teamExists = await aadGroupNameExists(request.msGraph, dbTeam.name)
    if (teamExists) {
      throw Boom.conflict('Team already exists in AAD')
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
      return h.response({ message: 'success', team }).code(201)
    } catch (error) {
      if (error.code === MongoErrors.DuplicateKey) {
        throw Boom.conflict('Team already exists in DB')
      }
      throw error
    }
  }
}

export { createTeamController }
