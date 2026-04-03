import {Modules} from '@medusajs/framework/utils'
import {createStep, StepResponse} from '@medusajs/framework/workflows-sdk'

type SendNotificationInput = {
	to: string
	channel: string
	template: string
	data: Record<string, unknown>
}

export const sendNotificationStep = createStep('send-notification', async (input: SendNotificationInput, {container}) => {
	const notificationModule = container.resolve(Modules.NOTIFICATION)

	const notification = await notificationModule.createNotifications(input)

	return new StepResponse(notification)
})
