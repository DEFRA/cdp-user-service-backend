import { statusCodes } from '@defra/cdp-validation-kit'

const healthController = {
  handler: (_request, h) =>
    h.response({ message: 'success' }).code(statusCodes.ok)
}

export { healthController }
