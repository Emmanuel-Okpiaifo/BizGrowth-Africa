import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView as trackAnalyticsPageView } from '../utils/analytics';
import { initPixel, trackPageView as trackMetaPageView } from '../utils/metaPixel';

/**
 * Hook to automatically track page views on route changes
 * Works with react-router-dom
 */
export function usePageTracking() {
	const location = useLocation();
	const isInitialMount = useRef(true);
	const pixelInitialized = useRef(false);

	useEffect(() => {
		if (pixelInitialized.current) return;
		initPixel();
		pixelInitialized.current = true;
	}, []);

	useEffect(() => {
		// Wait a bit for gtag to be fully loaded, especially on initial page load
		const timeoutId = setTimeout(() => {
			// Track page view on route change and initial load
			trackAnalyticsPageView(location.pathname, location.search);
			if (!isInitialMount.current) {
				trackMetaPageView();
			}
			
			// Log for debugging (remove in production if needed)
			if (isInitialMount.current) {
				isInitialMount.current = false;
			}
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [location.pathname, location.search]);
}
