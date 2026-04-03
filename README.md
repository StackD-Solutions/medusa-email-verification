<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.stackd-solutions.io"><img src="docs/logo.svg" alt="StackD Solutions" width="250"></a>
  <br>Medusa Email Verification Plugin
  <br>
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackd-solutions/medusa-email-verification"><img src="https://img.shields.io/npm/v/@stackd-solutions/medusa-email-verification" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@stackd-solutions/medusa-email-verification"><img src="https://img.shields.io/npm/dm/@stackd-solutions/medusa-email-verification" alt="npm downloads"></a>
  <img src="https://img.shields.io/npm/l/@stackd-solutions/medusa-email-verification" alt="Apache License">
  <img src="https://img.shields.io/npm/types/@stackd-solutions/medusa-email-verification" alt="Types Included">
</p>

A [Medusa v2](https://medusajs.com/) plugin that adds email verification for customers. When a customer registers, they receive a verification email with a tokenized link. The plugin tracks verification status per customer and exposes both storefront and admin API endpoints.

## Features

- Automatic verification email on customer registration (via `customer.created` subscriber, configurable)
- Token-based verification with configurable expiry (default: 24 hours)
- Store API endpoints for sending, verifying, and checking verification status
- Admin API endpoint to check a customer's verification status
- Admin widget showing verification status on the customer detail page
- Workflow and steps for sending verification emails via Medusa's notification module

## Prerequisites

This plugin sends emails through Medusa's [Notification Module](https://docs.medusajs.com/resources/architectural-modules/notification). You need:

1. **A notification provider** configured for the `email` channel (e.g. SendGrid, Resend, SES, or any custom provider).
2. **An email template** named `verify-email` registered with your notification provider. The template receives the following data:

| Variable           | Type   | Description                                  |
| ------------------ | ------ | -------------------------------------------- |
| `customer_name`    | string | The customer's first name (or empty string)  |
| `verification_url` | string | Full URL the customer should click to verify |

## Installation

```bash
yarn add @stackd-solutions/medusa-email-verification
```

## Configuration

Register the plugin and its module in your `medusa-config.ts`:

```typescript
import {defineConfig} from '@medusajs/framework/utils'

export default defineConfig({
	// ... other config
	plugins: [
		{
			resolve: '@stackd-solutions/medusa-email-verification',
			options: {}
		}
	],
	modules: [
		{
			resolve: '@stackd-solutions/medusa-email-verification/modules/email-verification',
			options: {
				// All options are optional with sensible defaults
				tokenExpiryHours: 24,
				autoSendOnRegister: true,
				callbackUrl: 'https://mystore.com/email/verify'
			}
		}
	]
})
```

### Plugin Options

| Option               | Type      | Default | Description                                                              |
| -------------------- | --------- | ------- | ------------------------------------------------------------------------ |
| `tokenExpiryHours`   | `number`  | `24`    | How long a verification token remains valid (in hours)                   |
| `autoSendOnRegister` | `boolean` | `true`  | Whether to automatically send a verification email on customer creation  |
| `callbackUrl`        | `string`  | —       | Override the default callback URL (falls back to `STORE_CORS`-based URL) |

After adding the plugin, run migrations:

```bash
npx medusa db:migrate
```

### Environment Variables

The subscriber uses `STORE_CORS` to build the default callback URL for verification emails sent on customer registration:

```
STORE_CORS=http://localhost:8000
```

The default callback URL is constructed as `{first STORE_CORS origin}/email/verify`. You can override this globally via the `callbackUrl` plugin option, or per-request by using the send endpoint directly with a custom `callback_url`.

## API Endpoints

| Method | Endpoint                                  | Scope | Auth | Description                                   |
| ------ | ----------------------------------------- | ----- | ---- | --------------------------------------------- |
| POST   | `/store/email/verify/send`                | Store | ✅   | Send a verification email to the customer     |
| POST   | `/store/email/verify`                     | Store | ➖   | Verify an email token (public)                |
| GET    | `/store/email/verify/status`              | Store | ✅   | Check verification status of current customer |
| GET    | `/admin/customers/:id/email/verification` | Admin | ✅   | Get verification status for a customer        |

## Admin Widget

The plugin adds a widget to the **customer detail page** in the Medusa Admin dashboard. It displays a green "Verified" or red "Unverified" badge.

## Workflow

The plugin exposes a `sendVerificationEmailWorkflow` that can be used programmatically:

```typescript
import {sendVerificationEmailWorkflow} from '@stackd-solutions/medusa-email-verification/workflows/send-verification-email'

await sendVerificationEmailWorkflow(container).run({
	input: {
		customer_id: 'cus_123',
		email: 'customer@example.com',
		customer_name: 'John',
		callback_url: 'https://mystore.com/email/verify'
	}
})
```

The workflow consists of two steps:

1. **generate-verification-token** - Creates a verification token (UUID) with a configurable expiry (default: 24 hours), stored in the `email_verification` table.
2. **send-notification** - Sends the email via the notification module using the `verify-email` template.

## Build

```bash
yarn build
```

This runs `medusa plugin:build` followed by a separate type declaration build.

## Development

Start the plugin in development/watch mode:

```bash
yarn dev
```

## Types

The plugin exports the following types:

```typescript
import type {
	VerifyTokenBody,
	SendVerificationBody,
	VerifyTokenResponse,
	SendVerificationResponse,
	EmailVerificationStatusResponse,
	SendVerificationEmailInput,
	EmailVerificationPluginOptions
} from '@stackd-solutions/medusa-email-verification'
```

| Type                              | Description                                     |
| --------------------------------- | ----------------------------------------------- |
| `VerifyTokenBody`                 | `{ token: string }`                             |
| `SendVerificationBody`            | `{ callback_url: string }`                      |
| `VerifyTokenResponse`             | `{ success: boolean, message?: string }`        |
| `SendVerificationResponse`        | `{ message: string }`                           |
| `EmailVerificationStatusResponse` | `{ verified: boolean }`                         |
| `SendVerificationEmailInput`      | Input for the verification workflow              |
| `EmailVerificationPluginOptions`  | Plugin options (validated with Zod at startup)   |

The module key is also exported:

```typescript
import {EMAIL_VERIFICATION_MODULE} from '@stackd-solutions/medusa-email-verification'
```

## License

Apache 2.0
