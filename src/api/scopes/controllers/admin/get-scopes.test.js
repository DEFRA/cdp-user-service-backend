import { mockWellKnown } from '../../../../../test-helpers/mock-well-known.js'
import { createServer } from '../../../server.js'
import { scopes } from '@defra/cdp-validation-kit'
import { scopeDefinitions } from '../../../../config/scopes.js'

describe('#scope routes', () => {
  let server

  async function callWithAuth(url, method = 'GET') {
    return await server.inject({
      method,
      url,
      auth: {
        strategy: 'azure-oidc',
        credentials: {
          scope: [scopes.admin]
        }
      }
    })
  }

  beforeAll(async () => {
    mockWellKnown()
    server = await createServer()
    await server.initialize()
  })

  describe('/scopes/admin', () => {
    it('should return a list of all scopes', async () => {
      const { result, statusCode } = await callWithAuth('/scopes/admin')
      expect(statusCode).toBe(200)
      expect(result.length).toBe(Object.values(scopeDefinitions).length)
      for (const r of result) {
        expect(r).toMatchObject(scopeDefinitions[r.scopeId])
      }
    })
  })
})
