import {
  CognitoIdentityClient,
  GetOpenIdTokenForDeveloperIdentityCommand
} from '@aws-sdk/client-cognito-identity'

import { config } from '~/src/config/config.js'
import { createLogger } from '~/src/helpers/logging/logger.js'

const logger = createLogger()

const client = new CognitoIdentityClient()

/**
 * Attempts to get a federated token from cognito
 * @returns {Promise<string>}
 */
export async function getFederatedLoginToken() {
  const serviceName = config.get('service.name')
  const poolId = config.get('azureFederatedCredentials.identityPoolId')
  if (poolId === null) {
    throw new Error('AZURE_IDENTITY_POOL_ID is not set')
  }

  const logins = {}
  logins[`${serviceName}-aad-access`] = serviceName

  const input = {
    IdentityPoolId: poolId,
    Logins: logins
  }

  try {
    const command = new GetOpenIdTokenForDeveloperIdentityCommand(input)
    const result = await client.send(command)
    logger.info(`Got token from Cognition ${result?.IdentityId}`)
    return result.Token
  } catch (e) {
    logger.error(e)
    throw e
  }
}
