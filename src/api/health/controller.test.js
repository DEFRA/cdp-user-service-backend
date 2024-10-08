import { healthController } from '~/src/api/health/controller.js'

describe('#healthController', () => {
  const mockViewHandler = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  it('should provide expected response', () => {
    healthController.handler(null, mockViewHandler)

    expect(mockViewHandler.response).toHaveBeenCalledWith({
      message: 'success'
    })
    expect(mockViewHandler.code).toHaveBeenCalledWith(200)
  })
})
