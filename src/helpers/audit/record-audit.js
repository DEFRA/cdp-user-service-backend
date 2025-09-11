import { fetcher } from '../fetcher.js'
import { config } from '../../config/config.js'

export async function recordAudit({
  category,
  action,
  performedBy,
  performedAt,
  details
}) {
  const url = `${config.get('portalBackendUrl')}/audit`

  await fetcher(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      action,
      performedBy,
      performedAt,
      details
    })
  })
}
