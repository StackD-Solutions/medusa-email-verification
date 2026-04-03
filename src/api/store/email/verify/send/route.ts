import type {MedusaRequest, MedusaResponse} from '@medusajs/framework/http'
import {Modules} from '@medusajs/framework/utils'
import {EMAIL_VERIFICATION_MODULE} from '../../../../../modules/email-verification'
import type EmailVerificationModuleService from '../../../../../modules/email-verification/service'
import {requireCustomerId} from '../../../../../utils/utils'
import type {SendVerificationBody} from '../validators'

export async function POST(req: MedusaRequest<SendVerificationBody>, res: MedusaResponse) {
	const {callback_url} = req.body

	if (!callback_url) {
		return res.status(400).json({message: 'callback_url is required'})
	}

	const customerId = requireCustomerId(req)
	const emailVerificationService: EmailVerificationModuleService = req.scope.resolve(EMAIL_VERIFICATION_MODULE)
	const customerModule = req.scope.resolve(Modules.CUSTOMER)
	const notificationModule = req.scope.resolve(Modules.NOTIFICATION)

	const customer = await customerModule.retrieveCustomer(customerId)
	const {token} = await emailVerificationService.generateToken(customerId)

	const verificationUrl = `${callback_url}?token=${token}`

	await notificationModule.createNotifications({
		to: customer.email,
		channel: 'email',
		template: 'verify-email',
		data: {
			customer_name: customer.first_name || '',
			verification_url: verificationUrl
		}
	})

	return res.status(200).json({message: 'Verification email sent'})
}
