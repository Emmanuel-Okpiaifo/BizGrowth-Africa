import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Hook to automatically track page views on route changes
 * Works with react-router-dom
 */
export function usePageTracking() {
	const location = useLocation();

	useEffect(() => {
		// Track page view on route change
		trackPageView(location.pathname, location.search);
	}, [location.pathname, location.search]);
}
