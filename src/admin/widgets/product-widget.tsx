import {defineWidgetConfig} from '@medusajs/admin-sdk'
import {Container, Heading, Badge} from '@medusajs/ui'
import {useEffect, useState} from 'react'

type EmailVerificationData = {
	verified: boolean
	verified_at: string | null
}

const EmailVerificationWidget = ({data}: {data: {id: string}}) => {
	const [verification, setVerification] = useState<EmailVerificationData | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch(`/admin/customers/${data.id}/email/verification`, {
			credentials: 'include'
		})
			.then(res => res.json())
			.then(json => setVerification(json))
			.catch(() => setVerification(null))
			.finally(() => setLoading(false))
	}, [data.id])

	if (loading) {
		return (
			<Container className='divide-y p-0'>
				<div className='flex items-center justify-between px-6 py-4'>
					<Heading level='h2'>Email Verification</Heading>
					<span className='text-ui-fg-muted text-sm'>Loading...</span>
				</div>
			</Container>
		)
	}

	const isVerified = verification?.verified === true

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h2'>Email Verification</Heading>
				<Badge color={isVerified ? 'green' : 'red'}>{isVerified ? '\u2713 Verified' : '\u2717 Unverified'}</Badge>
			</div>
		</Container>
	)
}

export const config = defineWidgetConfig({
	zone: 'customer.details.before'
})

export default EmailVerificationWidget
