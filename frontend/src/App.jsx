import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LowfundPage from "./pages/LowfundPage";
import InfoPage from "./pages/Info";
import Redirect from './components/urlShortener/Redirect';
import LogMyIp from "./pages/LogMyIp";
import IpLogger from "./pages/IpLogger";
import GetView from "./pages/GetView";
import ZFlix from "./pages/ZFlix";
import Viewer from "./pages/Viewer";

import LoadingSpinner from "./components/LoadingSpinner";
import { ProtectedRoute, RedirectAuthenticatedUser, Protected, Beta } from './components/ProtectedRoutes';

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import React, { useEffect } from "react";

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div
			className='min-h-screen bg-gradient-to-br
				from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center relative overflow-hidden'
		>
			<FloatingShape color='bg-purple-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
			<FloatingShape color='bg-indigo-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
			<FloatingShape color='bg-violet-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />

			<Routes>
				<Route
					path='/'
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/catchip'
					element={
						<ProtectedRoute>
							<LogMyIp />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/logger/:shortUrl'
					element={
						<ProtectedRoute>
							<IpLogger />
						</ProtectedRoute>
					}
				/>
				<Route path="/:shortUrl" element={<Redirect />} />
				<Route
					path='/info'
					element={
						<Protected>
							<InfoPage />
						</Protected>
					}
				/>
				<Route
					path='/getview'
					element={
						<ProtectedRoute>
							
						  <GetView />
							
						</ProtectedRoute>
					}
				/>
				<Route
					path='/zflix/:meetingId'
					element={
							<ZFlix />
					}
				/>
				<Route
					path='/viewer/:meetingId'
					element={
						<ProtectedRoute>
							<Viewer />
						</ProtectedRoute>
					}
				/>
				
				<Route
					path='/signup'
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route path='/verify-email' element={<EmailVerificationPage />} />
				<Route
					path='/forgot-password'
					element={
						<RedirectAuthenticatedUser>
							<ForgotPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>

				<Route
					path='/reset-password/:token'
					element={
						<RedirectAuthenticatedUser>
							<ResetPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>

				<Route
					path='/lowfund'
					element={
						<RedirectAuthenticatedUser>
							<LowfundPage />
						</RedirectAuthenticatedUser>
					}
				/>
				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
