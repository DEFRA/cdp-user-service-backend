import { getUsers } from '~/src/api/users/helpers/get-users'
import { normaliseUser } from '~/src/api/users/helpers/normalise-user'

const getUsersController = {
  handler: async (request, h) => {
    const dbUsers = await getUsers(request.db)
    const users = dbUsers.map(normaliseUser)
    return h.response({ message: 'success', users }).code(200)
  }
}

export { getUsersController }
