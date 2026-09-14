import { subDays } from 'date-fns'
import { UTCDate } from '@date-fns/utc'

async function disableInactiveUsers(db, thresholdDays) {
  const now = new UTCDate()
  const cutoffDate = subDays(now, thresholdDays)
  const query = {
    disabled: { $ne: true },
    $or: [
      { lastActive: { $lt: cutoffDate } },
      {
        lastActive: { $exists: false },
        createdAt: { $lt: cutoffDate }
      }
    ]
  }

  const staleUsers = await db
    .collection('users')
    .find(query, { projection: { _id: 1, name: 1, lastActive: 1 } })
    .toArray()

  if (!staleUsers.length) {
    return []
  }

  for (const staleUser of staleUsers) {
    await db.collection('users').updateOne(
      { _id: staleUser._id },
      {
        $set: {
          disabled: true,
          disabledAt: now,
          disabledBy: 'system',
          disabledReason: 'inactivity',
          updatedAt: now
        }
      }
    )
  }

  return staleUsers
}

export { disableInactiveUsers }
