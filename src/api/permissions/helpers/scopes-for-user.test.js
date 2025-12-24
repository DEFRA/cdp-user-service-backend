import { addHours, subHours, subMinutes } from 'date-fns'
import { scopesForUser } from './scopes-for-user.js'
import { getUser } from '../../users/helpers/get-user.js'

vi.mock('../../users/helpers/get-user.js')

describe('#scopes-for-users', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-10-23T08:09:00.000Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('Should not return expired break glass permissions', async () => {
    getUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          teamId: 'forms',
          teamName: 'Forms',
          startDate: new Date('2024-09-29T09:00:00.000Z'),
          endDate: new Date('2024-09-29T10:00:00.000Z'),
          reason: 'test'
        }
      ]
    })
    const { scopes } = await scopesForUser({ id: 'mock-user-id-123456' })

    expect(scopes).toEqual(['user:mock-user-id-123456'])
  })

  test('Should not return scope for future break glass permissions', async () => {
    const fourHoursInTheFuture = addHours(new Date(), 4)
    const sixHoursInTheFuture = addHours(new Date(), 4)

    getUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          teamId: 'forms',
          teamName: 'Forms',
          startDate: fourHoursInTheFuture,
          endDate: sixHoursInTheFuture,
          reason: 'test'
        }
      ]
    })
    const result = await scopesForUser({ id: 'mock-user-id-78910' }, {})

    expect(result.scopes).toEqual(['user:mock-user-id-78910'])
  })

  test('Should grant break glass permission when its active', async () => {
    const tenMinutesAgo = subMinutes(new Date(), 10)
    const oneHourInTheFuture = addHours(new Date(), 1)

    getUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          teamId: 'forms',
          teamName: 'Forms',
          startDate: tenMinutesAgo,
          endDate: oneHourInTheFuture,
          reason: 'test'
        }
      ]
    })
    const result = await scopesForUser({ id: 'mock-user-id-45023' }, {})

    expect(result.scopes).toEqual([
      'permission:breakGlass:team:forms',
      'user:mock-user-id-45023'
    ])
  })

  test('Should grant non team based break glass permission when its active', async () => {
    const oneHourAgo = subHours(new Date(), 1)
    const twoHoursInTheFuture = addHours(new Date(), 2)

    getUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          startDate: oneHourAgo,
          endDate: twoHoursInTheFuture,
          reason: 'test'
        }
      ]
    })
    const result = await scopesForUser({ id: 'mock-user-id-3453' }, {})

    expect(result.scopes).toEqual([
      'permission:breakGlass',
      'user:mock-user-id-3453'
    ])
  })

  test('Should have break glass permission when "undefined" dates are passed', async () => {
    getUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          startDate: undefined,
          endDate: undefined,
          reason: 'test'
        }
      ]
    })
    const result = await scopesForUser({ id: 'mock-user-id-23489' }, {})

    expect(result.scopes).toEqual([
      'permission:breakGlass',
      'user:mock-user-id-23489'
    ])
  })

  test('Should not have break glass permission when only a startDate is passed', async () => {
    const oneHourAgo = subHours(new Date(), 1)

    getUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          startDate: oneHourAgo,
          endDate: undefined,
          reason: 'test'
        }
      ]
    })
    const result = await scopesForUser({ id: 'mock-user-id-5656' }, {})

    expect(result.scopes).toEqual(['user:mock-user-id-5656'])
  })

  test('Should not have break glass permission when only an endDate is passed', async () => {
    const twoHoursInTheFuture = addHours(new Date(), 2)

    getUser.mockResolvedValue({
      scopes: [
        {
          scopeId: '6750708d454fcbbcc1568154',
          scopeName: 'breakGlass',
          startDate: undefined,
          endDate: twoHoursInTheFuture,
          reason: 'test'
        }
      ]
    })
    const result = await scopesForUser({ id: 'mock-user-id-67674' }, {})

    expect(result.scopes).toEqual(['user:mock-user-id-67674'])
  })
})
