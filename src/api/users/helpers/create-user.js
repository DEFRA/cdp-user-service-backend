import Boom from '@hapi/boom'

import { getUser } from '~/src/api/users/helpers/get-user'
import { normaliseUser } from '~/src/api/users/helpers/normalise-user'
import { MongoErrors } from '~/src/helpers/mongodb-errors'
import { aadUserExists } from '~/src/api/users/helpers/aad-user-exists'

/**
 * Check a user exists in AAD. If so then create a user in CDP Database.
 * If user already exists in CDP Database error, otherwise return created user.
 *
 * @param graphClient
 * @param db
 * @param logger
 * @param payload
 *
 * @typedef {Object} cdpUser - The CDP user from the DB
 * @property {string} cdpUser.userId - The AAD User ID
 * @property {string} cdpUser.email - The AAD Users email
 * @property {string} [cdpUser.github] - The GitHub username
 * @property {string} [cdpUser.name] - CDP users name
 * @property {string} [cdpUser.defraAwsId] - Defra AWS ID
 * @property {string} [cdpUser.defraVpnId] - Defra VPN ID
 *
 * @returns {Promise<Boom<unknown>|cdpUser|*>}
 */
async function createUser({ graphClient, db, logger, payload }) {
  try {
    const dbUser = {
      _id: payload.userId, // TODO should we be using the internal _id or just create userId?
      name: payload.name,
      email: payload.email,
      github: payload?.github,
      defraVpnId: payload?.defraVpnId,
      defraAwsId: payload?.defraAwsId
    }

    const userExists = await aadUserExists(graphClient, payload.userId)

    if (!userExists) {
      throw Boom.conflict('User does not exist in AAD')
    }

    const insertResult = await db.collection('users').insertOne(dbUser)
    const createdUser = await getUser(db, insertResult.insertedId)

    logger.info(`Created user ${createdUser.userId} ${createdUser.name}`) // TODO is this ok being in logs?

    return normaliseUser(createdUser)
  } catch (error) {
    if (error?.code === MongoErrors.DuplicateKey) {
      throw Boom.conflict('User already exists in DB')
    }

    throw error
  }
}

export { createUser }
