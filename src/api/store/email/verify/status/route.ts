import type {MedusaRequest, MedusaResponse} from '@medusajs/framework/http'
import {EMAIL_VERIFICATION_MODULE} from '../../../../../modules/email-verification'
import type EmailVerificationModuleService from '../../../../../modules/email-verification/service'
import {requireCustomerId} from '../../../../../utils/utils'

export const GET = async (req: MedusaRequest, res: MedusaResponse): Promise<MedusaResponse> => {
	const customerId = requireCustomerId(req)
	const emailVerificationService: EmailVerificationModuleService = req.scope.resolve(EMAIL_VERIFICATION_MODULE)

	const verified = await emailVerificationService.isVerified(customerId)

	return res.status(200).json({verified})
}
