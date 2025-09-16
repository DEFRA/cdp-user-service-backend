import { MongoClient } from 'mongodb'

import { config } from '../src/config/config.js'
import { testDbName } from './constants.js'

/* @typedef mongo
 * @property {MongoClient} [client] - The MongoDB client instance.
 * @property {Db} [db] - The database instance.
 */
const mongo = {}

/**
 * Connects to the in-memory MongoDB instance used for testing.
 * Note: Use the server and request decorators first to access the database if they are available. Otherwise, use this
 * function to connect directly to the test mongo instance.
 * @param {string} [dbName] - defaults to testDbName
 * @returns {Promise<{client: MongoClient, db: Db}>}
 */
async function connectToTestMongoDB(dbName = testDbName) {
  if (!mongo.mongoClient) {
    const { mongoOptions } = config.get('mongo')

    mongo.mongoClient = new MongoClient(globalThis.__MONGO_URI__, mongoOptions)
    mongo.db = mongo.mongoClient.db(dbName)

    await mongo.db.command({ ping: 1 })
  }

  return mongo
}

export { connectToTestMongoDB }
/**
 * @typedef {import('mongodb').Db} Db
 */
