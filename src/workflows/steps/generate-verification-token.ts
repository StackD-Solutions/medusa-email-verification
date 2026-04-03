import {createStep, StepResponse} from '@medusajs/framework/workflows-sdk'
import {EMAIL_VERIFICATION_MODULE} from '../../modules/email-verification'
import type EmailVerificationModuleService from '../../modules/email-verification/service'

type GenerateTokenInput = {
	customer_id: string
}

export const generateVerificationTokenStep = createStep('generate-verification-token', async (input: GenerateTokenInput, {container}) => {
	const emailVerificationService: EmailVerificationModuleService = container.resolve(EMAIL_VERIFICATION_MODULE)

	const {token} = await emailVerificationService.generateToken(input.customer_id)

	return new StepResponse({token})
})
