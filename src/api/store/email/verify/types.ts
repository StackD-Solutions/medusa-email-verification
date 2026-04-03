export type VerifyTokenResponse = {
	success: boolean
	message?: string
}

export type SendVerificationResponse = {
	message: string
}

export type EmailVerificationStatusResponse = {
	verified: boolean
}
