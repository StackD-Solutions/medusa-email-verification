import type {AuthenticatedMedusaRequest, MedusaResponse} from '@medusajs/framework/http'
import {EMAIL_VERIFICATION_MODULE} from '../../../../../../modules/email-verification'
import type EmailVerificationModuleService from '../../../../../../modules/email-verification/service'

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse): Promise<MedusaResponse> => {
	const {id} = req.params
	const emailVerificationService: EmailVerificationModuleService = req.scope.resolve(EMAIL_VERIFICATION_MODULE)

	const record = await emailVerificationService.getVerification(id)

	return res.status(200).json({
		verified: record?.verified_at !== null && record?.verified_at !== undefined,
		verified_at: record?.verified_at ?? null
	})
}
