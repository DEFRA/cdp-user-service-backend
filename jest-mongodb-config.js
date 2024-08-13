export default {
  mongodbMemoryServerOptions: {
    binary: {
      skipMD5: true
    },
    autoStart: false,
    instance: {
      dbName: 'cdp-user-service-backend'
    }
  },
  useSharedDBForAllJestWorkers: false,
  mongoURLEnvName: 'MONGO_URI'
}
