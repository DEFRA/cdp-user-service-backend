import { connectToTestMongoDB } from './connect-to-test-mongodb.js'
import {
  deleteMany as createDeleteMany,
  replaceMany as createReplaceMany,
  replaceOne as createReplaceOne
} from './mongo-helpers.js'

/**
 * Provides access to the test MongoDB database with pre-bound helper functions.
 * Call this in beforeAll to get db access without spinning up a full server.
 *
 * @returns {Promise<{
 *   db: import('mongodb').Db,
 *   replaceOne: (name: string, value: object, id?: any) => Promise<any>,
 *   replaceMany: (name: string, items: object[]) => Promise<any>,
 *   deleteMany: (collections: string[]) => Promise<any[]>
 * }>}
 *
 * @example
 * let db, replaceMany, deleteMany
 *
 * beforeAll(async () => {
 *   ({ db, replaceMany, deleteMany } = await withTestDb())
 * })
 *
 * beforeEach(async () => {
 *   await replaceMany('users', [userFixture1, userFixture2])
 * })
 *
 * afterEach(async () => {
 *   await deleteMany(['users'])
 * })
 */
async function withTestDb() {
  const mongo = await connectToTestMongoDB()
  const { db } = mongo

  return {
    db,
    replaceOne: createReplaceOne(db),
    replaceMany: createReplaceMany(db),
    deleteMany: createDeleteMany(db)
  }
}

export { withTestDb }
