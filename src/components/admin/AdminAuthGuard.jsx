import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import { isAuthenticated, clearAuthSession } from '../../utils/adminAuth';

/**
 * Admin Authentication Guard
 * Wraps admin content and shows login if not authenticated
 * Uses sessionStorage so auth clears when tab closes
 */
export default function AdminAuthGuard({ children }) {
	const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		// Check if user is authenticated
		const checkAuth = () => {
			const authenticated = isAuthenticated();
			const authTime = sessionStorage.getItem('admin_auth_time');
			
			// Optional: Check if session is too old (e.g., 8 hours)
			if (authTime) {
				const timeDiff = Date.now() - parseInt(authTime, 10);
				const maxAge = 8 * 60 * 60 * 1000; // 8 hours
				
				if (timeDiff > maxAge) {
					// Session expired
					clearAuthSession();
					setIsAuthenticatedState(false);
					setIsChecking(false);
					return;
				}
			}

			setIsAuthenticatedState(authenticated);
			setIsChecking(false);
		};

		checkAuth();

		// Clear auth when tab becomes hidden (user switches tabs or minimizes)
		// This ensures fresh login when returning
		const handleVisibilityChange = () => {
			if (document.hidden) {
				// Tab is now hidden - clear auth after a delay
				// This way if user quickly switches back, they stay logged in
				// But if they close tab and open new one, they need to login
				setTimeout(() => {
					if (document.hidden) {
						clearAuthSession();
					}
				}, 1000); // 1 second delay
			}
		};

		// Clear auth when page is about to unload (tab closing)
		const handleBeforeUnload = () => {
			clearAuthSession();
		};

		// Clear auth when storage changes (another tab logged out)
		const handleStorageChange = (e) => {
			if (e.key === 'admin_authenticated' && !e.newValue) {
				setIsAuthenticatedState(false);
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('storage', handleStorageChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);

	const handleLogin = () => {
		setIsAuthenticatedState(true);
	};

	// Show loading state briefly
	if (isChecking) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#0A0F1A] dark:via-[#0B1220] dark:to-[#0A0F1A]">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	// Show login if not authenticated
	if (!isAuthenticatedState) {
		return <AdminLogin onLogin={handleLogin} />;
	}

	// Show admin content if authenticated
	return <>{children}</>;
}
