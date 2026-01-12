import { fetcher } from '../fetcher.js'
import { config } from '../../config/config.js'
import { createLogger } from '../logging/logger.js'

const logger = createLogger()

export function recordAudit(auditDetails) {
  const { category, action, performedBy, performedAt, details } = auditDetails
  const url = `${config.get('portalBackendUrl')}/audit`

  logger.debug(auditDetails, 'Audit record')

  try {
    return fetcher(url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify({
        category,
        action,
        performedBy,
        performedAt,
        details
      })
    })
  } catch (error) {
    logger.error(error, 'Failed to record audit record')
    return null
  }
}
