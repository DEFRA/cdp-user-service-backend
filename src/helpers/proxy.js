import { URL } from 'node:url'
import { ProxyAgent } from 'undici'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { config } from '~/src/config/index.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const proxyUrlConfig = config.get('httpsProxy') ?? config.get('httpProxy')
const logger = createLogger()

/**
 *
 * @param proxyUrl
 * @returns {{proxyAgent: ProxyAgent, port: (number), httpAndHttpsProxyAgent: HttpsProxyAgent<string>, url: URL}|null}
 */
function provideProxy(proxyUrl = proxyUrlConfig) {
  if (proxyUrl) {
    const url = new URL(proxyUrl)
    const port = url.protocol.toLowerCase() === 'http' ? 80 : 443

    logger.debug(`Proxy set up using ${url.origin}:${port}`)

    return {
      url,
      port,
      proxyAgent: new ProxyAgent({
        uri: proxyUrl,
        keepAliveTimeout: 10,
        keepAliveMaxTimeout: 10
      }),
      httpAndHttpsProxyAgent: new HttpsProxyAgent(url)
    }
  }

  return null
}

/**
 * Provide Node.js fetch with dispatcher ProxyAgent when http/s proxy url config has been set
 * @param url
 * @param options
 * @returns {Promise}
 */
function proxyFetch(url, options) {
  const proxy = provideProxy()

  if (!proxy) {
    return fetch(url, options)
  }

  logger.debug(
    `Fetching: ${url} via the proxy: ${proxy?.url.origin}:${proxy.port}`
  )

  return fetch(url, {
    ...options,
    dispatcher: proxy.proxyAgent
  })
}

export { proxyFetch, provideProxy }
