import { UTCDate } from '@date-fns/utc'
import { getUser } from './get-user.js'

async function enableUser(db, userId) {
  await db.collection('users').findOneAndUpdate(
    { _id: userId },
    {
      $unset: {
        disabled: '',
        disabledAt: '',
        disabledBy: '',
        disabledReason: ''
      },
      $set: {
        updatedAt: new UTCDate()
      }
    }
  )

  return await getUser(db, userId)
}

export { enableUser }
