import {Modules} from '@medusajs/framework/utils'
import {EMAIL_VERIFICATION_MODULE} from '../../../../../../../src/modules/email-verification'
import {POST} from '../../../../../../../src/api/store/email/verify/send/route'
import {
  createMockCustomerModule,
  createMockEmailVerificationService,
  createMockNotificationModule,
  createMockRequest,
  createMockResponse
} from '../../../../../helpers/mock-route'

const setup = (opts?: {customerId?: string | null; body?: Record<string, unknown>}) => {
  const emailVerificationService = createMockEmailVerificationService()
  const customerModule = createMockCustomerModule()
  const notificationModule = createMockNotificationModule()
  const res = createMockResponse()
  const req = createMockRequest({
    customerId: opts?.customerId !== undefined ? opts.customerId : 'cust_1',
    body: opts?.body,
    services: {
      [EMAIL_VERIFICATION_MODULE]: emailVerificationService,
      [Modules.CUSTOMER]: customerModule,
      [Modules.NOTIFICATION]: notificationModule
    }
  })
  return {req, res, emailVerificationService, customerModule, notificationModule}
}

describe('POST /store/email/verify/send', () => {
  it('should send verification email', async () => {
    const {req, res, emailVerificationService, customerModule, notificationModule} = setup({
      body: {callback_url: 'https://example.com/verify'}
    })
    customerModule.retrieveCustomer.mockResolvedValue({
      id: 'cust_1',
      email: 'test@example.com',
      first_name: 'John'
    })
    emailVerificationService.generateToken.mockResolvedValue({token: 'token-123'})

    await POST(req as any, res as any)

    expect(customerModule.retrieveCustomer).toHaveBeenCalledWith('cust_1')
    expect(emailVerificationService.generateToken).toHaveBeenCalledWith('cust_1')
    expect(notificationModule.createNotifications).toHaveBeenCalledWith({
      to: 'test@example.com',
      channel: 'email',
      template: 'verify-email',
      data: {
        customer_name: 'John',
        verification_url: 'https://example.com/verify?token=token-123'
      }
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({message: 'Verification email sent'})
  })

  it('should use empty string when customer has no first_name', async () => {
    const {req, res, emailVerificationService, customerModule, notificationModule} = setup({
      body: {callback_url: 'https://example.com/verify'}
    })
    customerModule.retrieveCustomer.mockResolvedValue({
      id: 'cust_1',
      email: 'test@example.com',
      first_name: null
    })
    emailVerificationService.generateToken.mockResolvedValue({token: 'token-456'})

    await POST(req as any, res as any)

    expect(notificationModule.createNotifications).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({customer_name: ''})
      })
    )
  })

  it('should throw when not authenticated', async () => {
    const {req, res} = setup({customerId: null, body: {callback_url: 'https://example.com/verify'}})

    await expect(POST(req as any, res as any)).rejects.toThrow('Customer authentication required')
  })
})
