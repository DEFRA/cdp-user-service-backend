async function scopeNameExists(db, value) {
  const scope = await db.collection('scopes').findOne({ value })
  return scope !== null
}

export { scopeNameExists }
