import { ObjectId } from 'mongodb'

/**
 * A helper to allow us to move off using ObjectId as our main scope ID
 * while maintaining backward compatability.
 *
 * Returns an instance of ObjectId when id looks like its one
 * otherwise returns the id as-is if it's not an ObjectId.
 *
 * @param {string|ObjectId} id
 * @returns {ObjectId|string}
 */
export function maybeObjectId(id) {
  if (ObjectId.isValid(id)) {
    return new ObjectId(id)
  }
  return id
}
