import {EMAIL_VERIFICATION_MODULE} from '../../../../../../../../src/modules/email-verification'
import {GET} from '../../../../../../../../src/api/admin/customers/[id]/email/verification/route'
import {
  createMockEmailVerificationService,
  createMockRequest,
  createMockResponse
} from '../../../../../../helpers/mock-route'

const setup = (opts?: {params?: Record<string, string>}) => {
  const emailVerificationService = createMockEmailVerificationService()
  const res = createMockResponse()
  const req = createMockRequest({
    params: opts?.params ?? {id: 'cust_1'},
    services: {[EMAIL_VERIFICATION_MODULE]: emailVerificationService}
  })
  return {req, res, emailVerificationService}
}

describe('GET /admin/customers/:id/email/verification', () => {
  it('should return verified status when customer has verified email', async () => {
    const {req, res, emailVerificationService} = setup()
    emailVerificationService.getVerification.mockResolvedValue({
      customer_id: 'cust_1',
      verified_at: new Date('2026-01-01')
    })

    await GET(req as any, res as any)

    expect(emailVerificationService.getVerification).toHaveBeenCalledWith('cust_1')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      verified: true,
      verified_at: new Date('2026-01-01')
    })
  })

  it('should return unverified when verified_at is null', async () => {
    const {req, res, emailVerificationService} = setup()
    emailVerificationService.getVerification.mockResolvedValue({
      customer_id: 'cust_1',
      verified_at: null
    })

    await GET(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({verified: false, verified_at: null})
  })

  it('should return unverified when no verification record exists', async () => {
    const {req, res, emailVerificationService} = setup()
    emailVerificationService.getVerification.mockResolvedValue(null)

    await GET(req as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({verified: false, verified_at: null})
  })

  it('should use customer id from params', async () => {
    const {req, res, emailVerificationService} = setup({params: {id: 'cust_999'}})
    emailVerificationService.getVerification.mockResolvedValue(null)

    await GET(req as any, res as any)

    expect(emailVerificationService.getVerification).toHaveBeenCalledWith('cust_999')
  })
})
