const createTeamController = {
  handler: async (request, h) => {
    return h.response({ message: 'success' }).code(200)
  }
}

export { createTeamController }
