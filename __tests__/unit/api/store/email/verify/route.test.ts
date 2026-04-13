import {EMAIL_VERIFICATION_MODULE} from '../../../../../../src/modules/email-verification'
import {POST} from '../../../../../../src/api/store/email/verify/route'
import {
  createMockEmailVerificationService,
  createMockRequest,
  createMockResponse
} from '../../../../helpers/mock-route'

const setup = (opts?: {body?: Record<string, unknown>}) => {
  const emailVerificationService = createMockEmailVerificationService()
  const res = createMockResponse()
  const req = createMockRequest({
    body: opts?.body,
    services: {[EMAIL_VERIFICATION_MODULE]: emailVerificationService}
  })
  return {req, res, emailVerificationService}
}

describe('POST /store/email/verify', () => {
  it('should return success when token is valid', async () => {
    const {req, res, emailVerificationService} = setup({body: {token: 'valid-token'}})
    emailVerificationService.verifyToken.mockResolvedValue({success: true, customerId: 'cust_1'})

    await POST(req as any, res as any)

    expect(emailVerificationService.verifyToken).toHaveBeenCalledWith('valid-token')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({success: true})
  })

  it('should return 400 when token is invalid', async () => {
    const {req, res, emailVerificationService} = setup({body: {token: 'bad-token'}})
    emailVerificationService.verifyToken.mockResolvedValue({success: false})

    await POST(req as any, res as any)

    expect(emailVerificationService.verifyToken).toHaveBeenCalledWith('bad-token')
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({success: false, message: 'Invalid or expired token'})
  })

  it('should return 400 when token is expired', async () => {
    const {req, res, emailVerificationService} = setup({body: {token: 'expired-token'}})
    emailVerificationService.verifyToken.mockResolvedValue({success: false})

    await POST(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({success: false, message: 'Invalid or expired token'})
  })
})
