import { config } from '~/src/config'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { Url } from 'url'

const proxyAgent = () => {
  if (config.get('httpsProxy') === '') {
    return null
  } else {
    const proxyUrl = new Url(config.get('httpsProxy'))
    return {
      url: proxyUrl,
      agent: new HttpsProxyAgent(proxyUrl)
    }
  }
}

export { proxyAgent }
