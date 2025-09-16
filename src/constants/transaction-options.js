import { config } from '../config/config.js'

const { mongoOptions } = config.get('mongo')

const transactionOptions = {
  ...mongoOptions,
  readConcern: { level: 'local' },
  writeConcern: { w: 'majority' }
}

export { transactionOptions }
