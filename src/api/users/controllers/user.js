import Boom from '@hapi/boom'
import { getUser } from '~/src/api/users/helpers/get-user'
import { isNull } from 'lodash'

const userController = {
  handler: async (request, h) => {
    const user = await getUser(request.db, request.params.userId)
    if (isNull(user)) {
      return Boom.boomify(Boom.notFound())
    }
  }
}

export { userController }
