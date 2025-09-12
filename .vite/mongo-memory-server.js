import { setup, teardown } from 'vitest-mongodb'

beforeAll(async () => {
  await setup({
    type: 'replSet',
    binary: {
      version: 'latest',
      downloadDir: './.cache/mongodb-binaries'
    },
    serverOptions: {
      replSet: { count: 1 }
    },
    autoStart: false
  })
  process.env.MONGO_URI = globalThis.__MONGO_URI__
})

afterAll(async () => {
  await teardown()
})
