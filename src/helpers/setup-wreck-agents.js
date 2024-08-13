import Wreck from '@hapi/wreck'

import { createLogger } from '~/src/helpers/logging/logger.js'

/**
 * Provide Wreck http client agents when http/s proxy url config has been set
 *
 * @param proxy
 */
function setupWreckAgents(proxy) {
  if (proxy?.httpAndHttpsProxyAgent) {
    createLogger().info('Wreck agents setup')

    const httpAndHttpsProxyAgent = proxy.httpAndHttpsProxyAgent

    Wreck.agents = {
      https: httpAndHttpsProxyAgent,
      http: httpAndHttpsProxyAgent,
      httpsAllowUnauthorized: httpAndHttpsProxyAgent
    }
  }
}

export { setupWreckAgents }
