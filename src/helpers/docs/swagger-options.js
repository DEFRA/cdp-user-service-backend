import { config } from '../../config/config.js'

const service = config.get('service')

/**
 * Hapi swagger options
 * Usage Guide - https://github.com/hapi-swagger/hapi-swagger/blob/master/usageguide.md
 * Swagger config - https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/configuration.md
 * @type {RegisterOptions} swaggerOptions
 */
export const swaggerOptions = {
  info: {
    title: 'Core Delivery Platform - User Service Backend API Documentation',
    version: service.version
  },
  grouping: 'tags',
  schemes: ['http'],
  tags: [
    {
      name: 'api',
      description: `${service.name} API`
    },
    {
      name: 'users',
      description: 'CDP user endpoints'
    },
    {
      name: 'teams',
      description: 'CDP team endpoints'
    },
    {
      name: 'scopes',
      description: 'CDP scope/permission endpoints'
    }
  ],
  documentationPath: '/docs',
  securityDefinitions: {
    jwt: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
      description: 'Enter "Bearer {token}"'
    }
  },
  security: [{ jwt: [] }],
  uiOptions: { defaultModelsExpandDepth: -1 }
}
/**
 * @import {RegisterOptions} from 'hapi-swagger'
 */
