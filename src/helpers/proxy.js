import { URL } from 'node:url'
import { EnvHttpProxyAgent } from 'undici'
import { ProxyAgent } from 'proxy-agent'
// import { HttpsProxyAgent } from 'https-proxy-agent'

import { config } from '~/src/config'
import { createLogger } from '~/src/helpers/logging/logger'

const proxyUrlConfig = config.get('httpsProxy') ?? config.get('httpProxy')
const logger = createLogger()

/**
 * Provide proxy agent detail when http/s proxy url config has been set
 *
 * @param proxyUrl
 * @returns {{proxyAgent: EnvHttpProxyAgent, port: (number), httpAndHttpsProxyAgent: ProxyAgent<string>, url: module:url.URL}|null}
 */
function provideProxy(proxyUrl = proxyUrlConfig) {
  if (proxyUrl) {
    const url = new URL(proxyUrl)
    const port = url.protocol.toLowerCase() === 'http' ? 80 : 443

    logger.debug(`Proxy set up using ${url.origin}:${port}`)

    return {
      url,
      port,
      proxyAgent: new EnvHttpProxyAgent(),
      httpAndHttpsProxyAgent: new ProxyAgent()
    }
  }

  return null
}

/**
 * Provide Node.js fetch with dispatcher ProxyAgent when http/s proxy url config has been set
 *
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
    `Fetching: ${url} via the proxy: ${proxy.url.origin}:${proxy.port}`
  )

  return fetch(url, {
    ...options,
    dispatcher: proxy.proxyAgent
  })
}

export { proxyFetch, provideProxy }
