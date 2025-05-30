import { MongoClient } from 'mongodb'
import { LockManager } from 'mongo-locks'

function mongoPlugin(config) {
  return {
    plugin: {
      name: 'mongodb',
      version: '1.0.0',
      register: async function (server, options) {
        server.logger.info('Setting up mongodb')

        const uri = config.get('mongoUri')
        const client = await MongoClient.connect(uri, {
          ...options.mongoOptions,
          ...(server.secureContext && { secureContext: server.secureContext })
        })
        const databaseName = config.get('mongoDatabase')
        const db = client.db(databaseName)
        const locker = new LockManager(db.collection('mongo-locks'))

        await createIndexes(db)

        server.logger.info(`mongodb connected to ${databaseName}`)

        server.decorate('server', 'mongoClient', client)
        server.decorate('request', 'mongoClient', client)

        server.decorate('server', 'db', db)
        server.decorate('request', 'db', db)

        server.decorate('request', 'locker', locker)

        server.events.on('stop', async () => {
          server.logger.info(`Closing Mongo client`)
          await client.close(true)
        })
      }
    },
    options: {
      mongoUrl: config.get('mongoUri'),
      databaseName: config.get('mongoDatabase'),
      mongoOptions: {
        retryWrites: false,
        readPreference: 'secondary'
      }
    }
  }
}

async function createIndexes(db) {
  await db.collection('mongo-locks').createIndex({ id: 1 })
  await db.collection('scopes').createIndex({ value: 1 }, { unique: true })
}

export { mongoPlugin }
