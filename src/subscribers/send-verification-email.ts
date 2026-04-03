import type {SubscriberArgs, SubscriberConfig} from '@medusajs/framework'
import {Modules} from '@medusajs/framework/utils'
import {EMAIL_VERIFICATION_MODULE} from '../modules/email-verification'
import type EmailVerificationModuleService from '../modules/email-verification/service'
import {sendVerificationEmailWorkflow} from '../workflows/send-verification-email'

type CustomerCreatedData = {
	id: string
}

export default async function sendVerificationEmailHandler({event: {data}, container}: SubscriberArgs<CustomerCreatedData>) {
	const emailVerificationService = container.resolve<EmailVerificationModuleService>(EMAIL_VERIFICATION_MODULE)

	if (!emailVerificationService.pluginOptions.autoSendOnRegister) {
		return
	}

	const customerModule = container.resolve(Modules.CUSTOMER)
	const customer = await customerModule.retrieveCustomer(data.id)

	const callbackUrl = emailVerificationService.pluginOptions.callbackUrl || process.env.STORE_CORS?.split(',')[0] + '/email/verify'

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
