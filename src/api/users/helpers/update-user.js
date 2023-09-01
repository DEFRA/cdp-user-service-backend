import { isNull } from 'lodash'

import { getUser } from '~/src/api/users/helpers/get-user'

async function updateUser(db, userId, updateFields) {
  if (!isNull(updateFields)) {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        ...updateFields,
        $set: {
          ...updateFields?.$set,
          updatedAt: new Date()
        }
      }
    )
  }

  return await getUser(db, userId)
}

export { updateUser }
