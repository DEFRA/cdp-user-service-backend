import { URL } from 'node:url'
import { ProxyAgent, setGlobalDispatcher } from 'undici'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { config } from '~/src/config/config.js'
import { createLogger } from '~/src/helpers/logging/logger.js'
import { bootstrap } from 'global-agent'
import Wreck from '@hapi/wreck'

const logger = createLogger()
/**
 * @typedef Proxy
 * @property {URL} url
 * @property {number} port
 * @property {ProxyAgent} proxyAgent
 * @property {HttpsProxyAgent<string>} httpAndHttpsProxyAgent
 */

/**
 * Provide ProxyAgent and HttpsProxyAgent when http/s proxy url config has been set
 * @returns {Proxy|null}
 */
function provideProxy() {
  const proxyUrl = config.get('httpProxy')

  if (!proxyUrl) {
    return null
  }

  const url = new URL(proxyUrl)
  const httpPort = 80
  const httpsPort = 443
  // The url.protocol value always has a colon at the end
  const defaultPort =
    url.protocol.toLowerCase() === 'http:' ? httpPort : httpsPort

  logger.debug(`Proxy set up using ${url.hostname}:${url.port ?? defaultPort}`)

  return {
    url,
    port: defaultPort,
    proxyAgent: new ProxyAgent({
      uri: proxyUrl,
      keepAliveTimeout: 10,
      keepAliveMaxTimeout: 10
    }),
    httpAndHttpsProxyAgent: new HttpsProxyAgent(url)
  }
}

/**
 *
 * @type {Proxy|null}
 */
export const proxy = provideProxy()

/**
 * Provide fetch with dispatcher ProxyAgent when http/s proxy url config has been set
 * @param {string | URL } url
 * @param {RequestInit} options
 * @returns {Promise}
 */
function proxyFetch(url, options) {
  const urlString = typeof url === 'string' ? url : url.toString()

  if (!proxy) {
    logger.debug({ url: urlString }, 'Fetching data')
    return fetch(url, options)
  }

  logger.debug(
    { url: urlString },
    `Fetching data via the proxy: ${proxy?.url.host}:${proxy.port}`
  )

  return fetch(url, {
    ...options,
    dispatcher: proxy.proxyAgent
  })
}

/**
 * Configures default proxies for various clients.
 */
function setupProxy() {
  const proxy = provideProxy()
  if (!proxy) return

  // global-agent (axios/request/and others)
  global.GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE = ''
  bootstrap()

  // Hapi built in http client
  Wreck.agents = {
    https: proxy.agent,
    http: proxy.agent,
    httpsAllowUnauthorized: proxy.agent
  }

  // undici proxy setup
  setGlobalDispatcher(proxy.proxyAgent)
}

export { provideProxy, setupProxy, proxyFetch }
