import { MongoBinary } from 'mongodb-memory-server-core'

MongoBinary.download({
  version: 'latest',
  downloadDir: './.cache/mongodb-binaries'
})
  .then((r) => r)
  .catch((err) => err)
