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
 * Check if analytics cookies are accepted
 */
export function isAnalyticsAccepted() {
	try {
		const preferences = localStorage.getItem('bizgrowth_cookie_preferences');
		if (preferences) {
			const prefs = JSON.parse(preferences);
			return prefs.analytics === true;
		}
		// Default to false if no preferences set
		return false;
	} catch {
		return false;
	}
}

/**
 * Track a page view
 * @param {string} pathname - The pathname of the page
 * @param {string} search - The search query string (optional)
 */
export function trackPageView(pathname, search = '') {
	// Only track if analytics is accepted
	if (!isAnalyticsAccepted()) {
		return;
	}

	if (!isGtagAvailable()) {
		// Retry after a short delay if gtag isn't ready yet
		setTimeout(() => {
			if (isGtagAvailable() && isAnalyticsAccepted()) {
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
	// Only track if analytics is accepted
	if (!isAnalyticsAccepted()) {
		return;
	}

	if (!isGtagAvailable()) {
		return;
	}

	if (!eventName || typeof eventName !== 'string') {
		if (import.meta.env.DEV) console.warn('GA4: trackEvent requires a valid event name string');
		return;
	}

	window.gtag('event', eventName, params);
}
