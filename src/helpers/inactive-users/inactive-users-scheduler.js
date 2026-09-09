import { UTCDate } from '@date-fns/utc'
import { schedule } from 'node-cron'
import { disableInactiveUsers } from '../../api/users/helpers/disable-inactive-users.js'
import { acquireLock } from '../mongo-lock.js'
import { recordAudit } from '../audit/record-audit.js'

export const inactiveUsersScheduler = {
  plugin: {
    name: 'inactive-users-scheduler',
    version: '1.0.0',
    once: true,
    register: async function (server, options) {
      if (!options.enabled) {
        server.logger.info('Inactive users scheduler disabled')
        return
      }

      server.logger.info(
        `Setting up inactive users cron scheduler: ${options.interval}`
      )

      const task = schedule(
        options.interval,
        async () =>
          await disableInactiveUsersTask(server, options.thresholdDays),
        {
          noOverlap: true
        }
      )

      server.events.on('stop', async () => {
        server.logger.info('Stopping inactive users scheduler')
        task.stop()
      })
    }
  },
  options: {
    interval: '0 3 * * *',
    enabled: true,
    thresholdDays: 60
  }
}

async function disableInactiveUsersTask(server, thresholdDays) {
  const lock = await acquireLock(
    server.locker,
    'disable-inactive-users',
    server.logger
  )

  if (!lock) {
    return
  }

  try {
    const staleUsers = await disableInactiveUsers(server.db, thresholdDays)

    for (const staleUser of staleUsers) {
      await recordAudit({
        category: 'user',
        action: 'Disabled',
        performedBy: 'system',
        performedAt: new UTCDate(),
        details: {
          user: {
            userId: staleUser._id,
            displayName: staleUser.name
          },
          reason: 'inactivity',
          trigger: 'scheduled',
          lastActive: staleUser.lastActive ?? null
        }
      })
    }
  } catch (error) {
    server.logger.error(error, 'Failed to disable inactive users')
  } finally {
    lock.free()
  }
}
