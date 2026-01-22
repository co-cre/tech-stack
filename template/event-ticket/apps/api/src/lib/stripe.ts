import Stripe from 'stripe'

export function getStripe(secretKey: string) {
	return new Stripe(secretKey, {
		apiVersion: '2024-12-18.acacia',
	})
}
