import type {MedusaRequest, MedusaResponse} from '@medusajs/framework/http'
import {EMAIL_VERIFICATION_MODULE} from '../../../../modules/email-verification'
import type EmailVerificationModuleService from '../../../../modules/email-verification/service'
import type {VerifyTokenBody} from './validators'

export const POST = async (req: MedusaRequest<VerifyTokenBody>, res: MedusaResponse): Promise<MedusaResponse> => {
	const {token} = req.body

	const emailVerificationService: EmailVerificationModuleService = req.scope.resolve(EMAIL_VERIFICATION_MODULE)

	const result = await emailVerificationService.verifyToken(token)

	if (!result.success) {
		return res.status(400).json({success: false, message: 'Invalid or expired token'})
	}

	return res.status(200).json({success: true})
}
