import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CheckoutCancelPage } from '@/pages/CheckoutCancelPage'
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { EventListPage } from '@/pages/EventListPage'
import { LoginPage } from '@/pages/LoginPage'
import { OrderListPage } from '@/pages/OrderListPage'
import { TicketDetailPage } from '@/pages/TicketDetailPage'
import { TicketListPage } from '@/pages/TicketListPage'
import { VerifyPage } from '@/pages/VerifyPage'
import { Route, Routes } from 'react-router-dom'

function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route element={<ProtectedRoute />}>
				<Route element={<Layout />}>
					<Route path="/" element={<EventListPage />} />
					<Route path="/events/:id" element={<EventDetailPage />} />
					<Route path="/checkout/success" element={<CheckoutSuccessPage />} />
					<Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
					<Route path="/tickets" element={<TicketListPage />} />
					<Route path="/tickets/:id" element={<TicketDetailPage />} />
					<Route path="/orders" element={<OrderListPage />} />
					<Route path="/verify" element={<VerifyPage />} />
				</Route>
			</Route>
		</Routes>
	)
}

export default App
