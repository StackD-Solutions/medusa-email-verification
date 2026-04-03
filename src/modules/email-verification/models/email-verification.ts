import {model} from '@medusajs/framework/utils'

const EmailVerification = model
	.define('email_verification', {
		id: model.id().primaryKey(),
		customer_id: model.text(),
		token: model.text(),
		verified_at: model.dateTime().nullable(),
		expires_at: model.dateTime()
	})
	.indexes([{on: ['customer_id'], unique: true}, {on: ['token']}])

export default EmailVerification
