// Simple mongo replaceOne wrapper test helper to reduce boilerplate
function replaceOne(db) {
  return (name, value, id = value._id) =>
    db.collection(name).replaceOne({ _id: id }, value, {
      upsert: true
    })
}

// Simple mongo replaceMany wrapper test helper to reduce boilerplate
function replaceMany(db) {
  return (name, items) =>
    db.collection(name).bulkWrite(
      items.map((item) => ({
        replaceOne: {
          filter: { _id: item._id },
          replacement: item,
          upsert: true
        }
      }))
    )
}

// Simple mongo deleteMany wrapper test helper to reduce boilerplate
function deleteMany(db) {
  return (value) => {
    const collectionArray = Array.isArray(value) ? value : [value]
    const collectionPromises = collectionArray.map((collection) =>
      db.collection(collection).deleteMany({})
    )

    return Promise.all(collectionPromises)
  }
}

export { replaceOne, replaceMany, deleteMany }
