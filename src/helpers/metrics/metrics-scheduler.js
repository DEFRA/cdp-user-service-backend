import { getUserStats } from '../../api/users/helpers/get-user-stats.js'
import { schedule } from 'node-cron'

export const metricsScheduler = {
  plugin: {
    name: 'metrics-scheduler',
    version: '1.0.0',
    once: true,
    register: async function (server, options) {
      if (!options.enabled) {
        server.logger.info('Metrics scheduler disabled')
        return
      }
      server.logger.info(
        `Setting up metrics cron scheduler: ${options.interval}`
      )
      const task = schedule(
        options.interval,
        async () => await reportMetrics(server),
        {
          noOverlap: true
        }
      )

      server.events.on('stop', async () => {
        server.logger.info('Stopping metrics scheduler')
        task.stop()
      })
    }
  },
  options: {
    interval: '0 * * * *',
    enabled: true
  }
}

async function reportMetrics(server) {
  try {
    const stats = await getUserStats(server.db)
    await server.metrics.counter('TotalUsers', stats.totalUsers)
    await server.metrics.counter('ActiveUsersWeek', stats.activeUsersWeek)
    await server.metrics.counter('ActiveUsersMonth', stats.activeUsersMonth)
  } catch (e) {
    server.logger.error(e)
  }
}
