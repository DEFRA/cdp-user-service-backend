import Boom from '@hapi/boom'
import { isNull } from 'lodash'
import { getUser } from '~/src/api/users/helpers/get-user'
import { normaliseUser } from '~/src/api/users/helpers/normalise-user'

const getUserController = {
  handler: async (request, h) => {
    const dbUser = await getUser(request.db, request.params.userId)
    if (isNull(dbUser)) {
      return Boom.notFound()
    }
    const user = normaliseUser(dbUser)
    return h.response({ message: 'success', user }).code(200)
  }
}

export { getUserController }
