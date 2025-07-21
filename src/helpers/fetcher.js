import { createLogger } from './logging/logger.js'
import { config } from '../config/config.js'
import { getTraceId } from '@defra/hapi-tracing'
import { HttpsProxyAgent } from 'https-proxy-agent'

/**
 * @param {string} url
 * @param {RequestOptions} options
 * @returns {Promise<Response>}
 */
async function fetcher(url, options = {}) {
  const logger = createLogger()
  const tracingHeader = config.get('tracing.header')
  const traceId = getTraceId()

  const proxyUri = process.env.HTTP_PROXY
  const dispatcher = proxyUri ? { agent: new HttpsProxyAgent(proxyUri) } : {}

  logger.debug({ url }, 'Fetching data')

  return await fetch(url, {
    ...options,
    ...dispatcher,
    method: options?.method || 'get',
    headers: {
      ...(options?.headers && options.headers),
      ...(traceId && { [tracingHeader]: traceId }),
      'Content-Type': 'application/json'
    }
  })
}

export { fetcher }
/**
 * import { Response, RequestOptions } from 'node-fetch'
 */
