import {z} from 'zod'

export const SendVerificationEmailRequest = z.object({callback_url: z.string()})
export type SendVerificationEmailRequest = z.infer<typeof SendVerificationEmailRequest>
export const SendVerificationEmailResponse = z.object({message: z.string()})
export type SendVerificationEmailResponse = z.infer<typeof SendVerificationEmailResponse>
export const Error = z.object({message: z.string(), code: z.string().optional()})
export type Error = z.infer<typeof Error>
export const VerifyEmailTokenRequest = z.object({token: z.string()})
export type VerifyEmailTokenRequest = z.infer<typeof VerifyEmailTokenRequest>
export const VerifyEmailTokenResponse = z.object({success: z.boolean(), message: z.string().optional()})
export type VerifyEmailTokenResponse = z.infer<typeof VerifyEmailTokenResponse>
export const EmailVerificationStatusResponse = z.object({verified: z.boolean()})
export type EmailVerificationStatusResponse = z.infer<typeof EmailVerificationStatusResponse>
