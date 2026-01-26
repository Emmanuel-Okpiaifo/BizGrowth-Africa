import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Hook to automatically track page views on route changes
 * Works with react-router-dom
 */
export function usePageTracking() {
	const location = useLocation();
	const isInitialMount = useRef(true);

	useEffect(() => {
		// Wait a bit for gtag to be fully loaded, especially on initial page load
		const timeoutId = setTimeout(() => {
			// Track page view on route change and initial load
			trackPageView(location.pathname, location.search);
			
			// Log for debugging (remove in production if needed)
			if (isInitialMount.current) {
				isInitialMount.current = false;
			}
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [location.pathname, location.search]);
}
