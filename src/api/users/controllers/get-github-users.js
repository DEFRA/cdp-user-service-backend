import Joi from 'joi'

const getGitHubUsersController = {
  options: {
    validate: {
      query: Joi.object({
        query: Joi.string().required()
      })
    }
  },
  handler: async (request, h) => {
    const users = []
    return h.response({ message: 'success', users }).code(200)
  }
}

export { getGitHubUsersController }
