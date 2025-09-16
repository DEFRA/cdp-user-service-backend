import { transactionOptions } from '../../../constants/transaction-options.js'

/**
 * Higher-order function, that wraps a function in a MongoDd transaction and provides db and transaction session to it.
 * For a transaction to work correctly you must pass the transactions session to all db operations made within the
 * transaction
 * @param {Request} request
 * @returns {function(function): Promise<*>}
 */
function withMongoTransaction(request) {
  /**
   * @param {function({db: Db, session: ClientSession}): Promise<*>} fn
   * @param {TransactionOptions} [options=transactionOptions]
   * @returns {Promise<*>}
   */
  return (fn, options = transactionOptions) => {
    const { db, mongoClient } = request

    return mongoClient.withSession(async (session) =>
      session.withTransaction(async () => fn({ db, session }), options)
    )
  }
}

export { withMongoTransaction }
/**
 * @typedef {import('mongodb').Db} Db
 * @typedef {import('mongodb').ClientSession} ClientSession
 * @typedef {import('mongodb').TransactionOptions} TransactionOptions
 * @typedef {import('@hapi/hapi').Request} Request
 */
