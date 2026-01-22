import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'

type VerifyResult = {
	success: boolean
	message: string
	ticket?: {
		eventTitle: string
		ticketTypeName: string
	}
}

export function VerifyPage() {
	const [scanning, setScanning] = useState(false)
	const [result, setResult] = useState<VerifyResult | null>(null)
	const scannerRef = useRef<Html5Qrcode | null>(null)

	useEffect(() => {
		return () => {
			if (scannerRef.current?.isScanning) {
				scannerRef.current.stop()
			}
		}
	}, [])

	const startScanning = async () => {
		setResult(null)
		setScanning(true)

		scannerRef.current = new Html5Qrcode('qr-reader')
		try {
			await scannerRef.current.start(
				{ facingMode: 'environment' },
				{ fps: 10, qrbox: { width: 250, height: 250 } },
				async (decodedText) => {
					await scannerRef.current?.stop()
					setScanning(false)
					await verifyTicket(decodedText)
				},
				() => {},
			)
		} catch (err) {
			console.error(err)
			setScanning(false)
		}
	}

	const stopScanning = async () => {
		if (scannerRef.current?.isScanning) {
			await scannerRef.current.stop()
		}
		setScanning(false)
	}

	const verifyTicket = async (qrToken: string) => {
		try {
			const res = await apiFetch<VerifyResult>('/tickets/verify', {
				method: 'POST',
				body: JSON.stringify({ qrToken }),
			})
			setResult(res)
		} catch (err) {
			setResult({
				success: false,
				message: err instanceof Error ? err.message : '検証に失敗しました',
			})
		}
	}

	return (
		<div className="mx-auto max-w-md">
			<h1 className="mb-6 text-3xl font-bold">入場確認</h1>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>QRコードスキャン</CardTitle>
					<CardDescription>チケットのQRコードをカメラで読み取ります</CardDescription>
				</CardHeader>
				<CardContent>
					<div
						id="qr-reader"
						className={`mb-4 overflow-hidden rounded-lg ${scanning ? 'h-64' : 'h-0'}`}
					/>
					{scanning ? (
						<Button onClick={stopScanning} variant="outline" className="w-full">
							スキャン停止
						</Button>
					) : (
						<Button onClick={startScanning} className="w-full">
							スキャン開始
						</Button>
					)}
				</CardContent>
			</Card>

			{result && (
				<Card className={result.success ? 'border-green-500' : 'border-destructive'}>
					<CardHeader>
						<CardTitle className={result.success ? 'text-green-600' : 'text-destructive'}>
							{result.success ? '✓ 入場OK' : '✗ 入場不可'}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">{result.message}</p>
						{result.ticket && (
							<div className="mt-4 space-y-1 text-sm">
								<p>
									<span className="text-muted-foreground">イベント: </span>
									{result.ticket.eventTitle}
								</p>
								<p>
									<span className="text-muted-foreground">チケット種別: </span>
									{result.ticket.ticketTypeName}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	)
}
