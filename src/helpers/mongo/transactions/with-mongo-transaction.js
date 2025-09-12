import { UTCDate } from '@date-fns/utc'

import { transactionOptions } from '../../../constants/transaction-options.js'

/**
 * Higher-order function, that wraps a function in a MongoDB transaction and provides db, session,  and logger
 *
 * @param {import('@hapi/hapi').Request} request
 * @returns {function(function, import('mongodb').TransactionOptions): Promise<*>}
 */
function withMongoTransaction(request) {
  return (fn, options = transactionOptions) => {
    const { db, mongoClient, logger } = request
    const now = new UTCDate()

    return mongoClient.withSession(async (session) =>
      session.withTransaction(
        async () => fn({ db, session, now, logger }),
        options
      )
    )
  }
}

export { withMongoTransaction }
