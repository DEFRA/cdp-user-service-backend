import { MongoClient } from 'mongodb'

import { config } from '~/src/config'

const mongoPlugin = {
  name: 'mongodb',
  version: '1.0.0',
  register: async function (server) {
    const mongoOptions = {
      retryWrites: false,
      readPreference: 'secondary'
    }

    const mongoUrl = new URL(config.get('mongoUri'))
    const databaseName = config.get('mongoDatabase')

    server.logger.info('Setting up mongodb')

    const mongoClient = await MongoClient.connect(
      mongoUrl.toString(),
      mongoOptions
    )
    const db = mongoClient.db(databaseName)

    server.logger.info(`mongodb connected to ${databaseName}`)

    server.decorate('request', 'mongoClient', mongoClient)
    server.decorate('request', 'db', db)
  }
}

export { mongoPlugin }
