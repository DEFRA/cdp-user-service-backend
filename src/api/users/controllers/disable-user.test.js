import { scopes } from '@defra/cdp-validation-kit'
import { scopeDefinitions } from '#config/scopes.js'
import {
  userAdminFixture,
  userTenantFixture
} from '../../../__fixtures__/users.js'
import { collections } from '../../../../test-helpers/constants.js'
import { mockWellKnown } from '../../../../test-helpers/mock-well-known.js'
import {
  deleteMany,
  replaceOne
} from '../../../../test-helpers/mongo-helpers.js'
import { grantPermissionToUser } from '../../permissions/helpers/relationships/relationships.js'
import { createTestServer } from '../../../../test-helpers/create-test-server.js'
import { users } from '../routes.js'

describe('PATCH:/users/{userId}/disable', () => {
  let server
  let replaceOneTestHelper
  let deleteManyTestHelper

  beforeAll(async () => {
    mockWellKnown()

    server = await createTestServer({ plugins: [users] })
    await server.initialize()

    replaceOneTestHelper = replaceOne(server.db)
    deleteManyTestHelper = deleteMany(server.db)
  })

  async function disableUserEndpoint(url, credentials = {}) {
    return await server.inject({
      method: 'PATCH',
      url,
      auth: {
        strategy: 'azure-oidc',
        credentials: {
          id: 'admin-caller-id',
          scope: [scopes.admin],
          ...credentials
        }
      }
    })
  }

  afterEach(async () => {
    await deleteManyTestHelper([collections.user, collections.relationship])
  })

  describe('When user id does not exist in the db', () => {
    test('Should provide expected not found error response', async () => {
      const { result, statusCode, statusMessage } = await disableUserEndpoint(
        '/users/user-doesnt-exist/disable'
      )

      expect(statusCode).toBe(404)
      expect(statusMessage).toBe('Not Found')
      expect(result).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'User not found'
      })
    })
  })

  describe('When the target user is an admin', () => {
    test('Should provide expected forbidden error response', async () => {
      await replaceOneTestHelper(collections.user, userAdminFixture)
      await grantPermissionToUser(
        server.db,
        userAdminFixture._id,
        scopeDefinitions.admin.scopeId
      )

      const { result, statusCode, statusMessage } = await disableUserEndpoint(
        `/users/${userAdminFixture._id}/disable`
      )

      expect(statusCode).toBe(403)
      expect(statusMessage).toBe('Forbidden')
      expect(result).toMatchObject({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Cannot disable an admin account'
      })
    })
  })

  describe('When an admin attempts to disable their own account', () => {
    test('Should provide expected forbidden error response', async () => {
      await replaceOneTestHelper(collections.user, userAdminFixture)
      await grantPermissionToUser(
        server.db,
        userAdminFixture._id,
        scopeDefinitions.admin.scopeId
      )

      const { result, statusCode, statusMessage } = await disableUserEndpoint(
        `/users/${userAdminFixture._id}/disable`,
        { id: userAdminFixture._id }
      )

      expect(statusCode).toBe(403)
      expect(statusMessage).toBe('Forbidden')
      expect(result).toMatchObject({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Cannot disable an admin account'
      })
    })
  })

  describe('When the target user is a non-admin, disabled by a different caller', () => {
    test('Should provide expected success response', async () => {
      await replaceOneTestHelper(collections.user, userTenantFixture)

      const { result, statusCode, statusMessage } = await disableUserEndpoint(
        `/users/${userTenantFixture._id}/disable`
      )

      expect(statusCode).toBe(200)
      expect(statusMessage).toBe('OK')
      expect(result).toMatchObject({
        userId: userTenantFixture._id,
        disabled: true,
        disabledBy: 'admin-caller-id',
        disabledReason: 'manual'
      })
    })
  })

  describe('Without auth', () => {
    test('Should provide expected unauthorized response', async () => {
      const { result, statusCode, statusMessage } = await server.inject({
        method: 'PATCH',
        url: `/users/${userTenantFixture._id}/disable`
      })

      expect(statusCode).toBe(401)
      expect(statusMessage).toBe('Unauthorized')
      expect(result).toMatchObject({
        message: 'Missing authentication'
      })
    })
  })
})
