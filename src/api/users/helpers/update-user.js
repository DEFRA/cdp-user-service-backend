import isNull from 'lodash/isNull.js'
import { UTCDate } from '@date-fns/utc'

import { getUser } from './get-user.js'

async function updateUser(db, userId, updateFields) {
  if (!isNull(updateFields)) {
    await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        ...updateFields,
        $set: {
          ...updateFields?.$set,
          updatedAt: new UTCDate()
        }
      }
    )
  }

  return await getUser(db, userId)
}

export { updateUser }
