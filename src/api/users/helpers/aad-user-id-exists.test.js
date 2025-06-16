import { vi } from 'vitest'
import { aadUserIdExists } from '~/src/api/users/helpers/aad-user-id-exists.js'

vi.mock('@microsoft/microsoft-graph-client')

describe('#aad-user-exists', () => {
  test('returns true if the msGraph call returns a value', async () => {
    const mockMsGraph = {
      api: vi.fn().mockReturnThis(),
      get: vi.fn(),
      delete: vi.fn()
    }
    mockMsGraph.get.mockReturnValue({ value: 'some value' })

    expect(await aadUserIdExists(mockMsGraph, '1234')).toBe(true)
  })

  test('returns false if the msGraph throws a 404 error', async () => {
    const mockMsGraph = {
      api: vi.fn().mockReturnThis(),
      get: vi.fn(),
      delete: vi.fn()
    }
    mockMsGraph.get.mockRejectedValue({ statusCode: 404 })

    expect(await aadUserIdExists(mockMsGraph, '1234')).toBe(false)
  })

  test('throws an exception the msGraph throws a non-404 error', async () => {
    const mockMsGraph = {
      api: vi.fn().mockReturnThis(),
      get: vi.fn(),
      delete: vi.fn()
    }

    const non404Error = new Error('Some error')
    mockMsGraph.get.mockRejectedValue(non404Error)

    await expect(aadUserIdExists(mockMsGraph, '1234')).rejects.toThrow(
      non404Error
    )
  })
})
