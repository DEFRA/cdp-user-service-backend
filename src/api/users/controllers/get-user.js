import Boom from '@hapi/boom'
import { isNull } from 'lodash'

import { getUser } from '~/src/api/users/helpers/get-user'

const getUserController = {
  handler: async (request, h) => {
    const user = await getUser(request.db, request.params.userId)
    if (isNull(user)) {
      throw Boom.notFound('User not found')
    }
    return h.response({ message: 'success', user }).code(200)
  }
}

export { getUserController }
