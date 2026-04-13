type MockJson = jest.Mock
type MockStatus = jest.Mock

export type MockResponse = {
  status: MockStatus
  json: MockJson
}

export type MockEmailVerificationService = {
  generateToken: jest.Mock
  verifyToken: jest.Mock
  isVerified: jest.Mock
  getVerification: jest.Mock
}

export type MockCustomerModule = {
  retrieveCustomer: jest.Mock
}

export type MockNotificationModule = {
  createNotifications: jest.Mock
}

export const createMockResponse = (): MockResponse => {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({json})
  return {status, json}
}

export const createMockEmailVerificationService = (
  overrides?: Partial<MockEmailVerificationService>
): MockEmailVerificationService => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  isVerified: jest.fn(),
  getVerification: jest.fn(),
  ...overrides
})

export const createMockCustomerModule = (): MockCustomerModule => ({
  retrieveCustomer: jest.fn()
})

export const createMockNotificationModule = (): MockNotificationModule => ({
  createNotifications: jest.fn()
})

export const createMockRequest = (opts: {
  params?: Record<string, string>
  query?: Record<string, string>
  body?: Record<string, unknown>
  customerId?: string | null
  services?: Record<string, unknown>
}): Record<string, unknown> => {
  const serviceMap: Record<string, unknown> = opts.services || {}

  return {
    params: opts.params || {},
    query: opts.query || {},
    body: opts.body || {},
    auth_context: opts.customerId ? {actor_id: opts.customerId} : undefined,
    scope: {
      resolve: (key: string): unknown => serviceMap[key]
    }
  }
}
