import {MedusaService} from '@medusajs/framework/utils'
import {z} from 'zod'
import EmailVerification from './models/email-verification'

const PluginOptionsSchema = z.object({
	tokenExpiryHours: z.number().default(24),
	autoSendOnRegister: z.boolean().default(true),
	callbackUrl: z.string().optional()
})

export type EmailVerificationPluginOptions = z.infer<typeof PluginOptionsSchema>

class EmailVerificationModuleService extends MedusaService({EmailVerification}) {
	private pluginOptions_: EmailVerificationPluginOptions

	constructor(container: Record<string, unknown>, options: Record<string, unknown>) {
		super(container, options)
		this.pluginOptions_ = this.validateOptions(options)
	}

	private validateOptions(options: Record<string, unknown>): EmailVerificationPluginOptions {
		return PluginOptionsSchema.parse(options)
	}

	get pluginOptions(): EmailVerificationPluginOptions {
		return this.pluginOptions_
	}

	async generateToken(customerId: string): Promise<{token: string}> {
		const token = crypto.randomUUID()
		const expiresAt = new Date(Date.now() + this.pluginOptions_.tokenExpiryHours * 60 * 60 * 1000)

		// Try to find existing record
		const [existing] = await this.listEmailVerifications({customer_id: customerId})

		if (existing) {
			await this.updateEmailVerifications({
				id: existing.id,
				token,
				verified_at: null,
				expires_at: expiresAt
			})
		} else {
			await this.createEmailVerifications({
				customer_id: customerId,
				token,
				expires_at: expiresAt
			})
		}

		return {token}
	}

	async verifyToken(token: string): Promise<{success: boolean; customerId?: string}> {
		const [record] = await this.listEmailVerifications({token})

		if (!record) {
			return {success: false}
		}

		if (record.verified_at) {
			return {success: false}
		}

		if (new Date(record.expires_at) < new Date()) {
			return {success: false}
		}

		await this.updateEmailVerifications({
			id: record.id,
			verified_at: new Date()
		})

		return {success: true, customerId: record.customer_id}
	}

	async isVerified(customerId: string): Promise<boolean> {
		const [record] = await this.listEmailVerifications({customer_id: customerId})
		return record?.verified_at !== null && record?.verified_at !== undefined
	}

	async getVerification(customerId: string) {
		const [record] = await this.listEmailVerifications({customer_id: customerId})
		return record ?? null
	}
}

export default EmailVerificationModuleService
