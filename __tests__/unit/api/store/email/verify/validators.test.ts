import {VerifyTokenRequestSchema, SendVerificationRequestSchema} from '../../../../../../src/api/store/email/verify/validators'

describe('VerifyTokenRequestSchema', () => {
	it('should accept valid token', () => {
		const result = VerifyTokenRequestSchema.safeParse({token: 'abc-123'})
		expect(result.success).toBe(true)
		expect(result.data).toEqual({token: 'abc-123'})
	})

	it('should reject missing token', () => {
		const result = VerifyTokenRequestSchema.safeParse({})
		expect(result.success).toBe(false)
	})

	it('should reject non-string token', () => {
		const result = VerifyTokenRequestSchema.safeParse({token: 123})
		expect(result.success).toBe(false)
	})
})

describe('SendVerificationRequestSchema', () => {
	it('should accept valid callback_url', () => {
		const result = SendVerificationRequestSchema.safeParse({callback_url: 'https://example.com/verify'})
		expect(result.success).toBe(true)
		expect(result.data).toEqual({callback_url: 'https://example.com/verify'})
	})

	it('should reject missing callback_url', () => {
		const result = SendVerificationRequestSchema.safeParse({})
		expect(result.success).toBe(false)
	})

	it('should reject non-string callback_url', () => {
		const result = SendVerificationRequestSchema.safeParse({callback_url: 123})
		expect(result.success).toBe(false)
	})
})
