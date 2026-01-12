import { createLogger } from './logging/logger.js'
import { config } from '../config/config.js'
import { getTraceId } from '@defra/hapi-tracing'
import Wreck from '@hapi/wreck'
import { statusCodes } from '@defra/cdp-validation-kit'
import Boom from '@hapi/boom'

/**
 * @param {string} url
 * @param {RequestOptions} options
 * @returns {Promise<{res: *, error}|{res: *, payload: *}>}
 */
async function fetcher(url, options = {}) {
  const logger = createLogger()
  const tracingHeader = config.get('tracing.header')
  const traceId = getTraceId()

  const method = (options?.method || 'get').toLowerCase()
  logger.debug(`fetching ${method} ${url}`)

  const { res, payload } = await Wreck[method](url, {
    ...options,
    json: true,
    headers: {
      ...(options?.headers && options.headers),
      ...(traceId && { [tracingHeader]: traceId }),
      'Content-Type': 'application/json'
    }
  })

  if (
    !res.statusCode ||
    res.statusCode < statusCodes.ok ||
    res.statusCode > statusCodes.miscellaneousPersistentWarning
  ) {
    return { res, error: payload || Boom.boomify(new Error('Unknown error')) }
  }

  return { res, payload }
}

export { fetcher }
