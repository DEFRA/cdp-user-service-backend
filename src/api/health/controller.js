import { statusCodes } from '@defra/cdp-validation-kit/src/constants/status-codes.js'

const healthController = {
  options: {
    tags: ['api', 'health check']
  },
  handler: (_request, h) =>
    h.response({ message: 'success' }).code(statusCodes.ok)
}

export { healthController }
