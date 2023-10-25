import convict from 'convict'
import path from 'path'

import { version } from '~/package.json'

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3001,
    env: 'PORT'
  },
  version: {
    doc: 'Api version',
    format: String,
    default: version
  },
  serviceName: {
    doc: 'Api Service Name',
    format: String,
    default: 'cdp-user-service-backend'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.normalize(path.join(__dirname, '..', '..'))
  },
  appPathPrefix: {
    doc: 'Application url path prefix this is needed only until we have host based routing',
    format: String,
    default: '/cdp-user-service-backend'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'production'
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: process.env.NODE_ENV !== 'production'
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'test'
  },
  logLevel: {
    doc: 'Logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
    env: 'LOG_LEVEL'
  },
  mongoUri: {
    doc: 'URI for mongodb',
    format: '*',
    default: 'mongodb://127.0.0.1:27017/',
    env: 'MONGO_URI'
  },
  mongoDatabase: {
    doc: 'database for mongodb',
    format: '*',
    default: 'cdp-user-service-backend',
    env: 'MONGO_DATABASE'
  },
  azureTenantId: {
    doc: 'Azure Active Directory Tenant ID',
    format: String,
    env: 'AZURE_TENANT_ID',
    default: '6f504113-6b64-43f2-ade9-242e05780007'
  },
  azureSSOClientId: {
    doc: 'Azure App SSO Client ID',
    format: String,
    env: 'AZURE_SSO_CLIENT_ID',
    default: '63983fc2-cfff-45bb-8ec2-959e21062b9a'
  },
  azureServicePrincipalId: {
    doc: 'Azure Service Principal ID',
    format: String,
    env: 'AZURE_SERVICE_PRINCIPAL_ID',
    default: '921c6ceb-e3d7-4408-8e23-5d5fe5495a6e'
  },
  azureClientId: {
    doc: 'Azure App Client ID',
    format: String,
    env: 'AZURE_CLIENT_ID',
    default: '81f438d7-b6e6-4f39-a2d8-10759536fb8a'
  },
  azureClientSecret: {
    doc: 'Azure App Client Secret',
    format: String,
    sensitive: true,
    env: 'AZURE_CLIENT_SECRET',
    default: ''
  },
  azureGroupPrefix: {
    doc: 'Azure Active Directory Group Prefix',
    format: String,
    env: 'AZURE_GROUP_PREFIX',
    default: 'AG-APP-CDP-'
  },
  azureAdminGroupId: {
    doc: 'Azure Active Directory Admin Group',
    format: String,
    env: 'AZURE_ADMIN_GROUP_ID',
    default: 'aabe63e7-87ef-4beb-a596-c810631fc474'
  },
  gitHubAppId: {
    doc: 'GitHub Api authentication App Id',
    format: String,
    env: 'GITHUB_APP_ID',
    default: '344866'
  },
  gitHubAppPrivateKey: {
    doc: 'GitHub Api authentication App Private Key. This key is a base64 encoded secret',
    format: '*',
    sensitive: true,
    env: 'GITHUB_APP_PRIVATE_KEY',
    default: ''
  },
  gitHubAppInstallationId: {
    doc: 'GitHub Api authentication App Installation Id',
    format: String,
    env: 'GITHUB_APP_INSTALLATION_ID',
    default: '38398116'
  },
  gitHubOrg: {
    doc: 'GitHub Organisation',
    format: String,
    env: 'GITHUB_APP_ORG_ID',
    default: 'DEFRA'
  }
})

config.validate({ allowed: 'strict' })

export { config }
