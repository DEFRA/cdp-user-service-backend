import { transactionOptions } from '../../../constants/transaction-options.js'

async function withMongoTransaction(request, fn) {
  const { mongoClient, logger } = request
  const session = mongoClient.startSession()
  try {
    return await session.withTransaction(() => fn(), transactionOptions)
  } catch (error) {
    logger.error({ error }, `Transaction aborted due to: ${error.message}`)
    throw error
  } finally {
    await session.endSession()
  }
}

export { withMongoTransaction }
