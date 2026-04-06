import type {SubscriberArgs, SubscriberConfig} from '@medusajs/framework'
import {Modules} from '@medusajs/framework/utils'
import {EMAIL_VERIFICATION_MODULE} from '../modules/email-verification'
import type EmailVerificationModuleService from '../modules/email-verification/service'
import {sendVerificationEmailWorkflow} from '../workflows/send-verification-email'

type CustomerCreatedData = {
	id: string
}

export const sendVerificationEmailHandler = async ({event: {data}, container}: SubscriberArgs<CustomerCreatedData>): Promise<void> => {
	const emailVerificationService = container.resolve<EmailVerificationModuleService>(EMAIL_VERIFICATION_MODULE)

	if (!emailVerificationService.autoSendOnRegister) {
		return
	}

	const customerModule = container.resolve(Modules.CUSTOMER)
	const customer = await customerModule.retrieveCustomer(data.id)

	const callbackUrl = emailVerificationService.callbackUrl || (process.env.STOREFRONT_URL || process.env.STORE_CORS?.split(',')[0]) + '/email/verify'

	await sendVerificationEmailWorkflow(container).run({
		input: {
			customer_id: customer.id,
			email: customer.email,
			customer_name: customer.first_name || '',
			callback_url: callbackUrl
		}
	})
}

export const config: SubscriberConfig = {
	event: 'customer.created'
}

export default sendVerificationEmailHandler
