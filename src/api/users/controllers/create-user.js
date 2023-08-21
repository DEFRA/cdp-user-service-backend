import { createUser } from '~/src/api/users/helpers/create-user'
import { createUserValidationSchema } from '~/src/api/users/helpers/create-user-validation-schema'

const createUserController = {
  options: {
    validate: {
      payload: createUserValidationSchema
    }
  },
  handler: async (request, h) => {
    const user = await createUser(request)

    return h.response({ message: 'success', user }).code(201)
  }
}

export { createUserController }
