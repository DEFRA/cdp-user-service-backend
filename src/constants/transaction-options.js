import { config } from '../config/config.js'

const { mongoOptions } = config.get('mongo')

const transactionOptions = {
  ...mongoOptions,
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority' }
}

export { transactionOptions }
