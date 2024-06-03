async function acquireLock(request, resource) {
  const lock = await request.locker.lock(resource)
  if (!lock) {
    request.logger.error(`Failed to acquire lock for ${resource}`)
    return null
  }
  return lock
}

async function requireLock(locker, resource) {
  const lock = await locker.lock(resource)
  if (!lock) {
    throw new Error(`Failed to acquire lock for ${resource}`)
  }
  return lock
}

export { acquireLock, requireLock }
