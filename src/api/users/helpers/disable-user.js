import { UTCDate } from '@date-fns/utc'
import { getUser } from './get-user.js'

async function disableUser(db, userId, disabledBy) {
  const now = new UTCDate()

  await db.collection('users').findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        disabled: true,
        disabledAt: now,
        disabledBy,
        disabledReason: 'manual',
        updatedAt: now
      }
    }
  )

  return await getUser(db, userId)
}

export { disableUser }
