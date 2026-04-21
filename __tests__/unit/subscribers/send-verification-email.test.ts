import {Modules} from '@medusajs/framework/utils'
import {EMAIL_VERIFICATION_MODULE} from '../../../src/modules/email-verification'
import defaultExport, {sendVerificationEmailHandler, config} from '../../../src/subscribers/send-verification-email'
import {sendVerificationEmailWorkflow} from '../../../src/workflows/send-verification-email'

jest.mock('../../../src/workflows/send-verification-email', () => ({
	sendVerificationEmailWorkflow: jest.fn()
}))

const mockRun = jest.fn()

type MockEmailVerificationService = {
	autoSendOnRegister: boolean
	callbackUrl: string | undefined
}

type MockCustomerModule = {
	retrieveCustomer: jest.Mock
}

const createMockEmailVerificationService = (overrides?: Partial<MockEmailVerificationService>): MockEmailVerificationService => ({
	autoSendOnRegister: true,
	callbackUrl: 'https://store.test/email/verify',
	...overrides
})

const createMockCustomerModule = (): MockCustomerModule => ({
	retrieveCustomer: jest.fn()
})

const setup = (
	opts: {
		serviceOverrides?: Partial<MockEmailVerificationService>
		customerId?: string
	} = {}
): {
	event: any
	container: any
	service: MockEmailVerificationService
	customerModule: MockCustomerModule
} => {
	const service = createMockEmailVerificationService(opts.serviceOverrides)
	const customerModule = createMockCustomerModule()
	const serviceMap: Record<string, unknown> = {
		[EMAIL_VERIFICATION_MODULE]: service,
		[Modules.CUSTOMER]: customerModule
	}
	const container = {resolve: (key: string): unknown => serviceMap[key]}
	const event = {data: {id: opts.customerId ?? 'cust_1'}}
	return {event, container, service, customerModule}
}

const ORIGINAL_ENV = process.env

beforeEach(() => {
	mockRun.mockReset()
	;(sendVerificationEmailWorkflow as jest.Mock).mockReset()
	;(sendVerificationEmailWorkflow as jest.Mock).mockReturnValue({run: mockRun})
	process.env = {...ORIGINAL_ENV}
	delete process.env.STOREFRONT_URL
	delete process.env.STORE_CORS
})

afterAll(() => {
	process.env = ORIGINAL_ENV
})

describe('config', () => {
	it('should subscribe to customer.created', () => {
		expect(config).toEqual({event: 'customer.created'})
	})

	it('should export the handler as default', () => {
		expect(defaultExport).toBe(sendVerificationEmailHandler)
	})
})

describe('sendVerificationEmailHandler', () => {
	it('should run workflow with customer data and service callback url', async () => {
		const {event, container, customerModule} = setup()
		customerModule.retrieveCustomer.mockResolvedValue({id: 'cust_1', email: 'user@test.com', first_name: 'Alice'})

		await sendVerificationEmailHandler({event, container} as any)

		expect(customerModule.retrieveCustomer).toHaveBeenCalledWith('cust_1')
		expect(mockRun).toHaveBeenCalledWith({
			input: {
				customer_id: 'cust_1',
				email: 'user@test.com',
				customer_name: 'Alice',
				callback_url: 'https://store.test/email/verify'
			}
		})
	})

	it('should skip when autoSendOnRegister is false', async () => {
		const {event, container, customerModule} = setup({serviceOverrides: {autoSendOnRegister: false}})

		await sendVerificationEmailHandler({event, container} as any)

		expect(customerModule.retrieveCustomer).not.toHaveBeenCalled()
		expect(mockRun).not.toHaveBeenCalled()
	})

	it('should pass empty customer_name when first_name is missing', async () => {
		const {event, container, customerModule} = setup()
		customerModule.retrieveCustomer.mockResolvedValue({id: 'cust_1', email: 'user@test.com', first_name: null})

		await sendVerificationEmailHandler({event, container} as any)

		expect(mockRun).toHaveBeenCalledWith(expect.objectContaining({input: expect.objectContaining({customer_name: ''})}))
	})

	it('should fall back to STOREFRONT_URL when service callbackUrl is undefined', async () => {
		process.env.STOREFRONT_URL = 'https://env.test'
		const {event, container, customerModule} = setup({serviceOverrides: {callbackUrl: undefined}})
		customerModule.retrieveCustomer.mockResolvedValue({id: 'cust_1', email: 'user@test.com', first_name: 'Alice'})

		await sendVerificationEmailHandler({event, container} as any)

		expect(mockRun).toHaveBeenCalledWith(
			expect.objectContaining({input: expect.objectContaining({callback_url: 'https://env.test/email/verify'})})
		)
	})

	it('should fall back to the first STORE_CORS origin when STOREFRONT_URL is not set', async () => {
		process.env.STORE_CORS = 'https://cors-a.test,https://cors-b.test'
		const {event, container, customerModule} = setup({serviceOverrides: {callbackUrl: undefined}})
		customerModule.retrieveCustomer.mockResolvedValue({id: 'cust_1', email: 'user@test.com', first_name: 'Alice'})

		await sendVerificationEmailHandler({event, container} as any)

		expect(mockRun).toHaveBeenCalledWith(
			expect.objectContaining({input: expect.objectContaining({callback_url: 'https://cors-a.test/email/verify'})})
		)
	})
})
