import {defineMiddlewares, authenticate, validateAndTransformBody} from '@medusajs/framework/http'
import {SendVerificationRequestSchema, VerifyTokenRequestSchema} from './store/email/verify/validators'

export default defineMiddlewares({
	routes: [
		{
			matcher: '/store/email/verify/send',
			method: 'POST',
			middlewares: [authenticate('customer', ['session']), validateAndTransformBody(SendVerificationRequestSchema)]
		},
		{
			matcher: '/store/email/verify',
			method: 'POST',
			middlewares: [validateAndTransformBody(VerifyTokenRequestSchema)]
		},
		{
			matcher: '/store/email/verify/status',
			method: 'GET',
			middlewares: [authenticate('customer', ['session'])]
		},
		{
			matcher: '/admin/customers/:id/email/verification',
			method: 'GET',
			middlewares: [authenticate('user', ['session', 'bearer'])]
		}
	]
})
