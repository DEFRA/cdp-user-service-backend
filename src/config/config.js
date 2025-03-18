import { cwd } from 'node:process'
import convict from 'convict'

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const isDevelopment = process.env.NODE_ENV === 'development'

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
  service: {
    name: {
      doc: 'Api Service Name',
      format: String,
      default: 'cdp-user-service-backend'
    },
    version: {
      doc: 'The service version, this variable is injected into your docker container in CDP environments',
      format: String,
      nullable: true,
      default: null,
      env: 'SERVICE_VERSION'
    },
    environment: {
      doc: 'The environment the app is running in',
      format: String,
      nullable: true,
      default: null,
      env: 'ENVIRONMENT'
    }
  },
  root: {
    doc: 'Project root',
    format: String,
    default: cwd()
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: isProduction
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: isDevelopment
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: isTest
  },
  log: {
    enabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: !isTest,
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: isProduction ? 'info' : 'debug',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in.',
      format: ['ecs', 'pino-pretty'],
      default: isProduction ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : []
    }
  },
  mongoUri: {
    doc: 'URI for mongodb',
    format: String,
    default: 'mongodb://127.0.0.1:27017/',
    env: 'MONGO_URI'
  },
  mongoDatabase: {
    doc: 'database for mongodb',
    format: String,
    default: 'cdp-user-service-backend',
    env: 'MONGO_DATABASE'
  },
  azureFederatedCredentials: {
    enabled: {
      doc: 'Use Azure Federated Credentials',
      format: Boolean,
      env: 'AZURE_FEDERATED_CREDENTIALS_ENABLED',
      default: false
    },
    identityPoolId: {
      doc: 'Azure Federated Credential Pool ID',
      format: String,
      env: 'AZURE_IDENTITY_POOL_ID',
      nullable: true,
      default: null
    }
  },
  azureTenantId: {
    doc: 'Azure Active Directory Tenant ID',
    format: String,
    env: 'AZURE_TENANT_ID',
    default: '6f504113-6b64-43f2-ade9-242e05780007'
  },
  azureServicePrincipalId: {
    doc: 'Azure Service Principal ID',
    format: String,
    env: 'AZURE_SERVICE_PRINCIPAL_ID',
    default: '0ddf3c00-ebab-4dad-aeb8-c07f2e3daeac'
  },
  azureClientId: {
    doc: 'Azure App Client ID',
    format: String,
    env: 'AZURE_CLIENT_ID',
    default: 'df53c4ec-92bf-4fc3-a672-cda33b0d9c00'
  },
  azureClientSecret: {
    doc: 'Azure App Client Secret',
    format: String,
    sensitive: true,
    env: 'AZURE_CLIENT_SECRET',
    default: 'test_value'
  },
  azureGroupPrefix: {
    doc: 'Azure Active Directory Group Prefix',
    format: String,
    env: 'AZURE_GROUP_PREFIX',
    default: 'AG-APP-CDP-'
  },
  azureClientBaseUrl: {
    doc: 'MsGraph api endpoint',
    format: String,
    env: 'AZURE_CLIENT_BASE_URL',
    default: 'http://localhost:3939/msgraph/'
  },
  get oidcWellKnownConfigurationUrl() {
    return {
      doc: 'OIDC .well-known configuration URL',
      format: String,
      env: 'OIDC_WELL_KNOWN_CONFIGURATION_URL',
      default: `http://cdp.127.0.0.1.sslip.io:3939/${this.azureTenantId.default}/v2.0/.well-known/openid-configuration`
    }
  },
  oidcAudience: {
    doc: 'OIDC Audience for verification',
    format: String,
    env: 'OIDC_AUDIENCE',
    default: '26372ac9-d8f0-4da9-a17e-938eb3161d8e'
  },
  oidcAdminGroupId: {
    doc: 'OIDC Admin Group ID',
    format: String,
    env: 'OIDC_ADMIN_GROUP_ID',
    default: 'aabe63e7-87ef-4beb-a596-c810631fc474'
  },
  gitHubAppId: {
    doc: 'GitHub Api authentication App Id',
    format: String,
    env: 'GITHUB_APP_ID',
    default: '405317'
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
    default: '42703033'
  },
  gitHubOrg: {
    doc: 'GitHub Organisation',
    format: String,
    env: 'GITHUB_APP_ORG_ID',
    default: 'DEFRA'
  },
  gitHubBaseUrl: {
    doc: 'Override the github base url for local testing',
    format: String,
    env: 'GITHUB_BASE_URL',
    default: ''
  },
  oidcKeysUrl: {
    doc: 'Url to the oidc JWT keys endpoint',
    format: String,
    default:
      'https://login.microsoftonline.com/6f504113-6b64-43f2-ade9-242e05780007/discovery/v2.0/keys',
    env: 'OIDC_KEYS_URL'
  },
  oidIssuerBaseUrl: {
    doc: 'Url to oidc issuer base url',
    format: String,
    default:
      'https://login.microsoftonline.com/6f504113-6b64-43f2-ade9-242e05780007/v2.0',
    env: 'OIDC_ISSUER_BASE_URL'
  },
  sharedRepos: {
    doc: 'Github repos all teams get access to',
    format: Array,
    default: ['cdp-app-config'],
    env: 'SHARED_REPOS'
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  tracing: {
    header: {
      doc: 'Which header to track',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  },
  enableSecureContext: {
    doc: 'Enable Secure Context',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_SECURE_CONTEXT'
  },
  enableDocumentation: {
    doc: 'Enable API documentation',
    format: Boolean,
    default: isDevelopment
  }
})

config.validate({ allowed: 'strict' })

export { config }
