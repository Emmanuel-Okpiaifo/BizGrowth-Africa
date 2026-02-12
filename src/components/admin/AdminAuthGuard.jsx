import { useState, useEffect, useRef } from 'react';
import AdminLogin from './AdminLogin';
import { isAuthenticated, clearAuthSession, updateLastActivity } from '../../utils/adminAuth';

const INACTIVITY_MS = 4 * 60 * 60 * 1000; // 4 hours
const ACTIVITY_THROTTLE_MS = 60 * 1000;    // update last activity at most once per minute
const INACTIVITY_CHECK_MS = 5 * 60 * 1000; // re-check every 5 minutes

/**
 * Admin Authentication Guard
 * Logout only when: user clicks Logout, tab is refreshed/closed, or inactive for 4+ hours.
 * Switching tabs does not log the user out; profile and dashboard stay correct until logout.
 */
export default function AdminAuthGuard({ children }) {
	const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
	const [isChecking, setIsChecking] = useState(true);
	const lastActivityUpdate = useRef(0);

	useEffect(() => {
		const checkAuth = () => {
			if (!isAuthenticated()) {
				setIsAuthenticatedState(false);
				setIsChecking(false);
				return;
			}
			const lastActivity = sessionStorage.getItem('admin_last_activity') || sessionStorage.getItem('admin_auth_time');
			if (lastActivity) {
				const elapsed = Date.now() - parseInt(lastActivity, 10);
				if (elapsed > INACTIVITY_MS) {
					clearAuthSession();
					setIsAuthenticatedState(false);
					setIsChecking(false);
					return;
				}
			}
			setIsAuthenticatedState(true);
			setIsChecking(false);
		};

		checkAuth();

		// Update last activity on user interaction (throttled)
		const handleActivity = () => {
			const now = Date.now();
			if (now - lastActivityUpdate.current >= ACTIVITY_THROTTLE_MS) {
				lastActivityUpdate.current = now;
				updateLastActivity();
			}
		};

		const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
		activityEvents.forEach((ev) => document.addEventListener(ev, handleActivity));

		// Re-check inactivity every 5 minutes
		const intervalId = setInterval(() => {
			if (!document.hidden && isAuthenticated()) {
				const lastActivity = sessionStorage.getItem('admin_last_activity') || sessionStorage.getItem('admin_auth_time');
				if (lastActivity && Date.now() - parseInt(lastActivity, 10) > INACTIVITY_MS) {
					clearAuthSession();
					setIsAuthenticatedState(false);
				}
			}
		}, INACTIVITY_CHECK_MS);

		// Clear auth on refresh or tab close (so next load shows login)
		const handleBeforeUnload = () => {
			clearAuthSession();
		};

		const handleStorageChange = (e) => {
			if (e.key === 'admin_authenticated' && !e.newValue) {
				setIsAuthenticatedState(false);
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('storage', handleStorageChange);

		return () => {
			activityEvents.forEach((ev) => document.removeEventListener(ev, handleActivity));
			clearInterval(intervalId);
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
