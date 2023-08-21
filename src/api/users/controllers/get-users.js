import { getUsers } from '~/src/api/users/helpers/get-users'

const getUsersController = {
  handler: async (request, h) => {
    const users = await getUsers(request.db)
    return h.response({ message: 'success', users }).code(200)
  }
}

export { getUsersController }
