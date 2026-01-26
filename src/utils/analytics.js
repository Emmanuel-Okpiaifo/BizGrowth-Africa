/**
 * Google Analytics 4 (GA4) Helper Utilities
 * Measurement ID: G-JEYX2LNTQY
 */

const GA_MEASUREMENT_ID = 'G-JEYX2LNTQY';

/**
 * Check if gtag is available
 */
function isGtagAvailable() {
	return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Track a page view
 * @param {string} pathname - The pathname of the page
 * @param {string} search - The search query string (optional)
 */
export function trackPageView(pathname, search = '') {
	if (!isGtagAvailable()) {
		// Retry after a short delay if gtag isn't ready yet
		setTimeout(() => {
			if (isGtagAvailable()) {
				const pagePath = pathname + search;
				window.gtag('config', GA_MEASUREMENT_ID, {
					page_path: pagePath,
				});
			}
		}, 500);
		return;
	}

	const pagePath = pathname + search;
	window.gtag('config', GA_MEASUREMENT_ID, {
		page_path: pagePath,
	});
}

/**
 * Track a custom event
 * @param {string} eventName - The name of the event
 * @param {object} params - Additional parameters for the event (optional)
 */
export function trackEvent(eventName, params = {}) {
	if (!isGtagAvailable()) {
		return;
	}

	if (!eventName || typeof eventName !== 'string') {
		console.warn('GA4: trackEvent requires a valid event name string');
		return;
	}

	window.gtag('event', eventName, params);
}
