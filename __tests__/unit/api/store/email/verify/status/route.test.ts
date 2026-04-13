import {EMAIL_VERIFICATION_MODULE} from '../../../../../../../src/modules/email-verification'
import {GET} from '../../../../../../../src/api/store/email/verify/status/route'
import {
  createMockEmailVerificationService,
  createMockRequest,
  createMockResponse
} from '../../../../../helpers/mock-route'

const setup = (opts?: {customerId?: string | null}) => {
  const emailVerificationService = createMockEmailVerificationService()
  const res = createMockResponse()
  const req = createMockRequest({
    customerId: opts?.customerId !== undefined ? opts.customerId : 'cust_1',
    services: {[EMAIL_VERIFICATION_MODULE]: emailVerificationService}
  })
  return {req, res, emailVerificationService}
}

describe('GET /store/email/verify/status', () => {
  it('should return verified true when email is verified', async () => {
    const {req, res, emailVerificationService} = setup()
    emailVerificationService.isVerified.mockResolvedValue(true)

    await GET(req as any, res as any)

    expect(emailVerificationService.isVerified).toHaveBeenCalledWith('cust_1')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({verified: true})
  })

  it('should return verified false when email is not verified', async () => {
    const {req, res, emailVerificationService} = setup()
    emailVerificationService.isVerified.mockResolvedValue(false)

    await GET(req as any, res as any)

    expect(emailVerificationService.isVerified).toHaveBeenCalledWith('cust_1')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({verified: false})
  })

  it('should throw when not authenticated', async () => {
    const {req, res} = setup({customerId: null})

    await expect(GET(req as any, res as any)).rejects.toThrow('Customer authentication required')
  })
})
