import { afterAll, beforeAll } from 'vitest'
import { setup, teardown } from 'vitest-mongodb'

beforeAll(async () => {
  await setup({
    binary: {
      version: 'latest'
    },
    serverOptions: {},
    autoStart: false
  })
  process.env.MONGO_URI = globalThis.__MONGO_URI__
})

afterAll(async () => {
  await teardown()
})
