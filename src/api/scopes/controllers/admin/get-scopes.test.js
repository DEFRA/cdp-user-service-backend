import { mockWellKnown } from '../../../../../test-helpers/mock-well-known.js'
import { scopes } from '@defra/cdp-validation-kit'
import { scopeDefinitions } from '../../../../config/scopes.js'
import { scopesAdmin } from '../../routes.js'
import { createTestServer } from '../../../../../test-helpers/create-test-server.js'

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
    server = await createTestServer({ plugins: [scopesAdmin] })

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
