import {z} from 'zod'

export const VerifyTokenRequestSchema = z.object({
	token: z.string()
})

export type VerifyTokenBody = z.infer<typeof VerifyTokenRequestSchema>

export const SendVerificationRequestSchema = z.object({
	callback_url: z.string()
})

export type SendVerificationBody = z.infer<typeof SendVerificationRequestSchema>
