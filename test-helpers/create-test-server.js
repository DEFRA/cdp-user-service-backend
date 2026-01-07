import Boom from '@hapi/boom'
import hapi from '@hapi/hapi'

import { connectToTestMongoDB } from './connect-to-test-mongodb.js'

/**
 * Creates a lightweight Hapi server for testing individual routes.
 * This is much faster and uses less memory than the full server.
 *
 * @param {object} options
 * @param {object|object[]} options.routes - Route definition(s) { method, path, ...controller }
 * @param {string[]} [options.defaultAuthScopes=[]] - Default scopes for authenticated requests
 * @returns {Promise<hapi.Server>}
 *
 * @example
 * // Single route
 * const server = await createTestServer({
 *   routes: { method: 'GET', path: '/users', ...getUsersController }
 * })
 *
 * @example
 * // Multiple routes (e.g., delete + get to verify)
 * const server = await createTestServer({
 *   routes: [
 *     { method: 'DELETE', path: '/users/{userId}', ...deleteUserController },
 *     { method: 'GET', path: '/users/{userId}', ...getUserController }
 *   ],
 *   defaultAuthScopes: ['admin']
 * })
 */
async function createTestServer({
  routes = [],
  defaultAuthScopes = [],
  plugins = []
}) {
  const routeArray = Array.isArray(routes) ? routes : [routes]

  const server = hapi.server({
    port: 0,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  // Connect to test MongoDB and decorate server/request
  const mongo = await connectToTestMongoDB()
  server.decorate('server', 'mongoClient', mongo.mongoClient)
  server.decorate('server', 'db', mongo.db)
  server.decorate('request', 'mongoClient', mongo.mongoClient)
  server.decorate('request', 'db', mongo.db)

  // Add a simple logger decorator (some controllers use request.logger)
  const noopLogger = {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {}
  }
  server.decorate('request', 'logger', noopLogger)
  server.decorate('server', 'logger', noopLogger)

  // Add noop octokit decorator (some controllers use request.octokit)
  const noopOctokit = {
    request: () => Promise.resolve({})
  }
  server.decorate('request', 'octokit', noopOctokit)
  server.decorate('server', 'octokit', noopOctokit)

  server.auth.scheme('mock-oidc', () => ({
    authenticate: (request, h) => {
      // Check if auth credentials were provided via server.inject({ auth: { credentials } })
      // When no auth is provided, request.auth.credentials will be undefined
      const providedCredentials = request.auth?.credentials

      if (!providedCredentials) {
        throw Boom.unauthorized('Missing authentication')
      }

      // Use provided credentials, merging with defaults
      const credentials = {
        id: 'test-user-id',
        displayName: 'Test User',
        email: 'test@example.com',
        scope: defaultAuthScopes,
        ...providedCredentials
      }

      return h.authenticated({ credentials })
    }
  }))

  server.auth.strategy('azure-oidc', 'mock-oidc')

  // Register all routes
  for (const route of routeArray) {
    server.route({
      method: route.method,
      path: route.path,
      options: route.options,
      handler: route.handler
    })
  }

  for (const plugin of plugins) {
    await server.register(plugin)
  }

  await server.initialize()

  return server
}

export { createTestServer }
