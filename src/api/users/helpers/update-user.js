import { omit } from 'lodash'

import { getUser } from '~/src/api/users/helpers/get-user'

async function updateUser(db, userId, updateFields) {
  const unsetFields = updateFields?.$unset
  const setFields = {
    ...omit(updateFields, ['$unset']),
    updatedAt: new Date()
  }

  await db
    .collection('users')
    .findOneAndUpdate({ _id: userId }, { $set: setFields, $unset: unsetFields })
  return await getUser(db, userId)
}

export { updateUser }
