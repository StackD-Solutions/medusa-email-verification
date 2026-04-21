jest.mock('@medusajs/framework/utils', () => {
	const passthrough = (): any => passthrough
	const chainable: any = new Proxy(() => chainable, {get: () => chainable})
	return {
		MedusaService: () =>
			class {
				constructor(_container?: unknown, _options?: unknown) {}
			},
		model: new Proxy({}, {get: () => chainable}),
		Module: passthrough
	}
})

import EmailVerificationModuleService from '../../../../src/modules/email-verification/service'

type ServiceWithMocks = EmailVerificationModuleService & {
	listEmailVerifications: jest.Mock
	createEmailVerifications: jest.Mock
	updateEmailVerifications: jest.Mock
}

const createService = (options: Record<string, unknown> = {}): ServiceWithMocks => {
	const service = new EmailVerificationModuleService({}, options) as ServiceWithMocks
	service.listEmailVerifications = jest.fn()
	service.createEmailVerifications = jest.fn()
	service.updateEmailVerifications = jest.fn()
	return service
}

describe('EmailVerificationModuleService', () => {
	describe('constructor', () => {
		it('should accept empty options and apply defaults', () => {
			const service = createService()
			expect(service.autoSendOnRegister).toBe(true)
			expect(service.callbackUrl).toBeUndefined()
		})

		it('should accept valid options', () => {
			const service = createService({tokenExpiryHours: 12, autoSendOnRegister: false, callbackUrl: 'https://store.test/verify'})
			expect(service.autoSendOnRegister).toBe(false)
			expect(service.callbackUrl).toBe('https://store.test/verify')
		})

		it('should throw on invalid option type', () => {
			expect(() => createService({tokenExpiryHours: 'twelve'})).toThrow()
		})
	})

	describe('generateToken', () => {
		it('should create a new record when none exists', async () => {
			const service = createService({tokenExpiryHours: 2})
			service.listEmailVerifications.mockResolvedValue([])

			const result = await service.generateToken('cust_1')

			expect(service.createEmailVerifications).toHaveBeenCalledWith(
				expect.objectContaining({customer_id: 'cust_1', token: expect.any(String), expires_at: expect.any(Date)})
			)
			expect(service.updateEmailVerifications).not.toHaveBeenCalled()
			expect(typeof result.token).toBe('string')
		})

		it('should update an existing record instead of creating a new one', async () => {
			const service = createService()
			service.listEmailVerifications.mockResolvedValue([{id: 'ev_1'}])

			const result = await service.generateToken('cust_1')

			expect(service.updateEmailVerifications).toHaveBeenCalledWith(
				expect.objectContaining({id: 'ev_1', token: result.token, verified_at: null, expires_at: expect.any(Date)})
			)
			expect(service.createEmailVerifications).not.toHaveBeenCalled()
		})

		it('should compute expires_at from tokenExpiryHours', async () => {
			const service = createService({tokenExpiryHours: 3})
			service.listEmailVerifications.mockResolvedValue([])
			const before = Date.now()

			await service.generateToken('cust_1')

			const call = service.createEmailVerifications.mock.calls[0][0]
			const expected = before + 3 * 60 * 60 * 1000
			expect(call.expires_at.getTime()).toBeGreaterThanOrEqual(expected)
			expect(call.expires_at.getTime()).toBeLessThan(expected + 1000)
		})
	})

	describe('verifyToken', () => {
		it('should mark record verified and return success with customer id', async () => {
			const service = createService()
			service.listEmailVerifications.mockResolvedValue([
				{id: 'ev_1', customer_id: 'cust_1', verified_at: null, expires_at: new Date(Date.now() + 60_000)}
			])

			const result = await service.verifyToken('tok')

			expect(service.updateEmailVerifications).toHaveBeenCalledWith(
				expect.objectContaining({id: 'ev_1', verified_at: expect.any(Date)})
			)
			expect(result).toEqual({success: true, customerId: 'cust_1'})
		})

		it('should return failure when no record matches the token', async () => {
			const service = createService()
			service.listEmailVerifications.mockResolvedValue([])

			const result = await service.verifyToken('tok')

			expect(result).toEqual({success: false})
			expect(service.updateEmailVerifications).not.toHaveBeenCalled()
		})

		it('should return failure when record is already verified', async () => {
			const service = createService()
			service.listEmailVerifications.mockResolvedValue([
				{id: 'ev_1', customer_id: 'cust_1', verified_at: new Date(), expires_at: new Date(Date.now() + 60_000)}
			])

			const result = await service.verifyToken('tok')

			expect(result).toEqual({success: false})
			expect(service.updateEmailVerifications).not.toHaveBeenCalled()
		})

		it('should return failure when token is expired', async () => {
			const service = createService()
			service.listEmailVerifications.mockResolvedValue([
				{id: 'ev_1', customer_id: 'cust_1', verified_at: null, expires_at: new Date(Date.now() - 60_000)}
			])

			const result = await service.verifyToken('tok')

			expect(result).toEqual({success: false})
			expect(service.updateEmailVerifications).not.toHaveBeenCalled()
		})
	})

	describe('isVerified', () => {
		it('should return true when record has verified_at', async () => {
			const service = createService()
			service.listEmailVerifications.mockResolvedValue([{verified_at: new Date()}])

			expect(await service.isVerified('cust_1')).toBe(true)
		})

		it('should return false when verified_at is null', async () => {
			const service = createService()
			service.listEmailVerifications.mockResolvedValue([{verified_at: null}])

			expect(await service.isVerified('cust_1')).toBe(false)
		})

		it('should return false when no record exists', async () => {
			const service = createService()
			service.listEmailVerifications.mockResolvedValue([])

			expect(await service.isVerified('cust_1')).toBe(false)
		})
	})

	describe('getVerification', () => {
		it('should return the record when it exists', async () => {
			const service = createService()
			const record = {id: 'ev_1', customer_id: 'cust_1'}
			service.listEmailVerifications.mockResolvedValue([record])

			expect(await service.getVerification('cust_1')).toBe(record)
		})

		it('should return null when no record exists', async () => {
			const service = createService()
			service.listEmailVerifications.mockResolvedValue([])

			expect(await service.getVerification('cust_1')).toBeNull()
		})
	})
})
