import { getTraceId } from '~/src/helpers/tracing/tracing.js'

export async function fetcher(url, options = {}) {
  return await fetch(url, {
    ...options,
    method: options?.method || 'get',
    headers: {
      ...(options?.headers && options.headers),
      'Content-Type': 'application/json',
      ...(getTraceId() ? { 'x-cdp-request-id': getTraceId() } : {})
    }
  })
}
