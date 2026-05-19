import { subDays } from 'date-fns'
import { UTCDate } from '@date-fns/utc'

/**
 *
 * @param {{}} db
 * @return {Promise<{totalUsers: number, activeUsersWeek: number, activeUsersMonth: number}>}
 */
export async function getUserStats(db) {
  const now = UTCDate.now()
  const last7Days = subDays(now, 7)
  const last30Days = subDays(now, 30)

  const totalUsers = await db.collection('users').countDocuments({})

  const activeUsersWeek = await db
    .collection('users')
    .countDocuments({ lastActive: { $gte: last7Days } })

  const activeUsersMonth = await db
    .collection('users')
    .countDocuments({ lastActive: { $gte: last30Days } })

  return {
    totalUsers,
    activeUsersWeek,
    activeUsersMonth
  }
}
