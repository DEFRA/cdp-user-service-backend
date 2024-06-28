import { MongoClient } from 'mongodb'
import { LockManager } from 'mongo-locks'

import { config } from '~/src/config'

const mongoPlugin = {
  name: 'mongodb',
  version: '1.0.0',
  register: async function (server) {
    const mongoOptions = {
      retryWrites: false,
      readPreference: 'secondary',
      ...(server.secureContext && { secureContext: server.secureContext })
    }

    const mongoUrl = config.get('mongoUri')
    const databaseName = config.get('mongoDatabase')

    server.logger.info('Setting up mongodb')

    const mongoClient = await MongoClient.connect(mongoUrl, mongoOptions)
    const db = mongoClient.db(databaseName)
    const locker = new LockManager(db.collection('mongo-locks'))

    server.logger.info(`mongodb connected to ${databaseName}`)

    server.decorate('server', 'mongoClient', mongoClient)
    server.decorate('request', 'mongoClient', mongoClient)

    server.decorate('server', 'db', db)
    server.decorate('request', 'db', db)

    server.decorate('request', 'locker', locker)

    await createIndexes(db)
  }
}

async function createIndexes(db) {
  await db.collection('mongo-locks').createIndex({ id: 1 })
}

export { mongoPlugin }
