import { config } from '~/src/config/config.js'
import { wellKnownResponseFixture } from '~/src/__fixtures__/well-known.js'

export function mockWellKnown(fetchMock = global.fetchMock) {
  const oidcWellKnownConfigurationUrl = config.get(
    'oidcWellKnownConfigurationUrl'
  )

  fetchMock.mockResponseOnceIf(oidcWellKnownConfigurationUrl, () =>
    Promise.resolve(JSON.stringify(wellKnownResponseFixture))
  )
}
