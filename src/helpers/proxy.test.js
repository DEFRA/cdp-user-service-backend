import { vi } from 'vitest'
import { ProxyAgent } from 'undici'

import { config } from '~/src/config/config.js'
import { provideProxy, proxyFetch } from '~/src/helpers/proxy.js'

const mockLoggerDebug = vi.fn()
vi.mock('~/src/helpers/logging/logger.js', () => ({
  createLogger: () => ({ debug: (...args) => mockLoggerDebug(...args) })
}))

const httpProxyUrl = 'http://proxy.example.com'
const httpPort = 80

describe('#proxy', () => {
  afterEach(() => {
    config.set('httpProxy', null)
    config.set('httpsProxy', null)
  })

  describe('#provideProxy', () => {
    describe('When a Proxy URL has not been set', () => {
      test('Should return null', () => {
        expect(provideProxy()).toBeNull()
      })
    })

    describe('When a HTTP Proxy URL has been set', () => {
      let result

      beforeEach(() => {
        config.set('httpProxy', httpProxyUrl)
        result = provideProxy()
      })

      test('Should make expected set up message', () => {
        expect(mockLoggerDebug).toHaveBeenCalledWith(
          `Proxy set up using proxy.example.com:80`
        )
      })

      test('Should set the correct port for HTTP', () => {
        expect(result).toHaveProperty('port', httpPort)
      })

      test('Should return expected HTTP Proxy object', () => {
        expect(result).toHaveProperty('url')
        expect(result).toHaveProperty('proxyAgent')
        expect(result).toHaveProperty('httpAndHttpsProxyAgent')
      })
    })
  })

  describe('#proxyFetch', () => {
    const secureUrl = 'https://beepboopbeep.com'

    test('Should pass options through', async () => {
      global.fetchMock.mockResolvedValue({})

      await proxyFetch(secureUrl, { method: 'GET' })

      expect(global.fetch).toHaveBeenCalledWith(secureUrl, {
        method: 'GET'
      })
    })

    describe('When no Proxy is configured', () => {
      test('Should fetch without Proxy Agent', async () => {
        global.fetchMock.mockResolvedValue({})

        await proxyFetch(secureUrl, {})

        expect(global.fetch).toHaveBeenCalledWith(secureUrl, {})
      })
    })

    describe('When proxy is configured', () => {
      beforeEach(async () => {
        config.set('httpProxy', httpProxyUrl)
        global.fetchMock.mockResolvedValue({})

        await proxyFetch(secureUrl, {})
      })

      test('Should fetch with Proxy Agent', () => {
        expect(global.fetch).toHaveBeenCalledWith(
          secureUrl,
          expect.objectContaining({
            dispatcher: expect.any(ProxyAgent)
          })
        )
      })

      test('Should make expected set up message', () => {
        expect(mockLoggerDebug).toHaveBeenNthCalledWith(
          1,
          `Proxy set up using proxy.example.com:80`
        )
      })

      test('Should make expected fetching via the proxy message', () => {
        expect(mockLoggerDebug).toHaveBeenNthCalledWith(
          2,
          { url: 'https://beepboopbeep.com' },
          'Fetching data via the proxy: proxy.example.com:80'
        )
      })
    })
  })
})
