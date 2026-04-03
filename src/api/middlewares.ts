import {defineMiddlewares, authenticate} from '@medusajs/framework/http'

export default defineMiddlewares({
	routes: [
		{
			matcher: '/store/email/verify/send',
			method: 'POST',
			middlewares: [authenticate('customer', ['session'])]
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
