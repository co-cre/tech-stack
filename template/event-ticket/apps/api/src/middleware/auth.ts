import type { User } from 'db/schema'
import { createMiddleware } from 'hono/factory'

// Firebase JWT検証（公開鍵をGoogleから取得）
async function verifyFirebaseToken(
	token: string,
	projectId: string,
): Promise<{ uid: string; email: string; name?: string } | null> {
	try {
		// JWTをデコード
		const parts = token.split('.')
		if (parts.length !== 3) return null

		const header = JSON.parse(atob(parts[0]))
		const payload = JSON.parse(atob(parts[1]))

		// 基本的な検証
		if (payload.aud !== projectId) return null
		if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null
		if (payload.exp < Date.now() / 1000) return null

		// 公開鍵を取得して署名を検証
		const keysRes = await fetch(
			'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
		)
		const keys = (await keysRes.json()) as Record<string, string>
		const key = keys[header.kid]
		if (!key) return null

		// Web Crypto APIで署名検証
		const pemContents = key
			.replace('-----BEGIN CERTIFICATE-----', '')
			.replace('-----END CERTIFICATE-----', '')
			.replace(/\s/g, '')

		const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))

		const cryptoKey = await crypto.subtle.importKey(
			'spki',
			extractPublicKeyFromCert(binaryDer),
			{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
			false,
			['verify'],
		)

		const signatureBytes = Uint8Array.from(
			atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')),
			(c) => c.charCodeAt(0),
		)
		const dataBytes = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)

		const valid = await crypto.subtle.verify(
			'RSASSA-PKCS1-v1_5',
			cryptoKey,
			signatureBytes,
			dataBytes,
		)

		if (!valid) return null

		return {
			uid: payload.sub,
			email: payload.email,
			name: payload.name,
		}
	} catch {
		return null
	}
}

// X.509証明書からSPKI形式の公開鍵を抽出
function extractPublicKeyFromCert(cert: Uint8Array): ArrayBuffer {
	// 簡略化: 証明書のTBSCertificate内のsubjectPublicKeyInfoを抽出
	// 実際のX.509パースは複雑なので、既知のオフセットを使用
	let offset = 0

	// SEQUENCE (Certificate)
	if (cert[offset++] !== 0x30) throw new Error('Invalid certificate')
	const certLen = parseLength(cert, offset)
	offset += certLen.bytes

	// SEQUENCE (TBSCertificate)
	if (cert[offset++] !== 0x30) throw new Error('Invalid TBSCertificate')
	const tbsLen = parseLength(cert, offset)
	offset += tbsLen.bytes

	// version [0] (optional)
	if (cert[offset] === 0xa0) {
		offset++
		const vLen = parseLength(cert, offset)
		offset += vLen.bytes + vLen.length
	}

	// serialNumber INTEGER
	if (cert[offset++] !== 0x02) throw new Error('Invalid serialNumber')
	const serialLen = parseLength(cert, offset)
	offset += serialLen.bytes + serialLen.length

	// signature AlgorithmIdentifier
	if (cert[offset++] !== 0x30) throw new Error('Invalid signature')
	const sigLen = parseLength(cert, offset)
	offset += sigLen.bytes + sigLen.length

	// issuer Name
	if (cert[offset++] !== 0x30) throw new Error('Invalid issuer')
	const issuerLen = parseLength(cert, offset)
	offset += issuerLen.bytes + issuerLen.length

	// validity Validity
	if (cert[offset++] !== 0x30) throw new Error('Invalid validity')
	const validityLen = parseLength(cert, offset)
	offset += validityLen.bytes + validityLen.length

	// subject Name
	if (cert[offset++] !== 0x30) throw new Error('Invalid subject')
	const subjectLen = parseLength(cert, offset)
	offset += subjectLen.bytes + subjectLen.length

	// subjectPublicKeyInfo
	if (cert[offset] !== 0x30) throw new Error('Invalid subjectPublicKeyInfo')
	const spkiStart = offset
	offset++
	const spkiLen = parseLength(cert, offset)
	const spkiEnd = offset + spkiLen.bytes + spkiLen.length

	return cert.slice(spkiStart, spkiEnd).buffer
}

function parseLength(data: Uint8Array, offset: number): { length: number; bytes: number } {
	const first = data[offset]
	if (first < 0x80) {
		return { length: first, bytes: 1 }
	}
	const numBytes = first & 0x7f
	let length = 0
	for (let i = 0; i < numBytes; i++) {
		length = (length << 8) | data[offset + 1 + i]
	}
	return { length, bytes: 1 + numBytes }
}

type AuthVariables = {
	firebaseUser: { uid: string; email: string; name?: string }
	user: User
}

export const authMiddleware = createMiddleware<{
	Bindings: Env
	Variables: AuthVariables
}>(async (c, next) => {
	const authHeader = c.req.header('Authorization')
	if (!authHeader?.startsWith('Bearer ')) {
		return c.json({ error: 'Unauthorized' }, 401)
	}

	const token = authHeader.slice(7)
	const firebaseUser = await verifyFirebaseToken(token, c.env.FIREBASE_PROJECT_ID)
	if (!firebaseUser) {
		return c.json({ error: 'Invalid token' }, 401)
	}

	c.set('firebaseUser', firebaseUser)
	await next()
})

export const optionalAuthMiddleware = createMiddleware<{
	Bindings: Env
	Variables: Partial<AuthVariables>
}>(async (c, next) => {
	const authHeader = c.req.header('Authorization')
	if (authHeader?.startsWith('Bearer ')) {
		const token = authHeader.slice(7)
		const firebaseUser = await verifyFirebaseToken(token, c.env.FIREBASE_PROJECT_ID)
		if (firebaseUser) {
			c.set('firebaseUser', firebaseUser)
		}
	}
	await next()
})
