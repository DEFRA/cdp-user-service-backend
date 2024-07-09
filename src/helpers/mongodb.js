import { MongoClient } from 'mongodb'
import { LockManager } from 'mongo-locks'

import { config } from '~/src/config'

const mongoPlugin = {
  plugin: {
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

      const client = await MongoClient.connect(mongoUrl, mongoOptions)
      const db = client.db(databaseName)
      const locker = new LockManager(db.collection('mongo-locks'))

      server.logger.info(`mongodb connected to ${databaseName}`)

      server.decorate('server', 'mongoClient', client)
      server.decorate('request', 'mongoClient', client)

      server.decorate('server', 'db', db)
      server.decorate('request', 'db', db)

      server.decorate('request', 'locker', locker)

      server.logger.info(`mongodb connected to ${databaseName}`)

      await createIndexes(db)

      server.events.on('stop', () => {
        server.logger.info(`Closing Mongo client`)
        client.close(true)
      })
    }
  }
}

async function createIndexes(db) {
  await db.collection('mongo-locks').createIndex({ id: 1 })
}

export { mongoPlugin }
