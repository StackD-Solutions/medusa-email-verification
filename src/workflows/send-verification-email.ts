import {createWorkflow, transform, WorkflowResponse} from '@medusajs/framework/workflows-sdk'
import {generateVerificationTokenStep} from './steps/generate-verification-token'
import {sendNotificationStep} from './steps/send-notification'
import type {SendVerificationEmailInput} from './types'

export const sendVerificationEmailWorkflow = createWorkflow('send-verification-email', (input: SendVerificationEmailInput) => {
	const {token} = generateVerificationTokenStep({customer_id: input.customer_id})

	const notificationData = transform({input, token}, data => ({
		to: data.input.email,
		channel: 'email',
		template: 'verify-email',
		data: {
			customer_name: data.input.customer_name,
			verification_url: `${data.input.callback_url}?token=${data.token}`
		}
	}))

	const notification = sendNotificationStep(notificationData)

	return new WorkflowResponse(notification)
})
