import { MongoClient } from 'mongodb'

/* @typedef mongo
 * @property {MongoClient} [client] - The MongoDB client instance.
 * @property {Db} [db] - The database instance.
 */
const mongo = {}

/**
 * Connects to the in-memory MongoDB instance used for testing.
 * Note: Use the server and request decorators first to access the database if they are available. Otherwise, use this
 * function to connect directly to the test mongo instance.
 * @returns {Promise<{client: MongoClient, db: Db}>}
 */
async function connectToTestMongoDB() {
  if (!mongo.client) {
    mongo.client = new MongoClient(globalThis.__MONGO_URI__)
    mongo.db = mongo.client.db('test')

    await mongo.db.command({ ping: 1 })
  }

  return mongo
}

export { connectToTestMongoDB }
/**
 * @typedef {import('mongodb').Db} Db
 */
