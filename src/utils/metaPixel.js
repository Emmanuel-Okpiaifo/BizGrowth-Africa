const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || 'YOUR_PIXEL_ID';
const COOKIE_PREFERENCES_KEY = 'bizgrowth_cookie_preferences';
const STANDARD_EVENTS = new Set([
	'PageView',
	'ViewContent',
	'Search',
	'AddToCart',
	'AddToWishlist',
	'InitiateCheckout',
	'AddPaymentInfo',
	'Purchase',
	'Lead',
	'CompleteRegistration',
	'Contact',
	'CustomizeProduct',
	'Donate',
	'FindLocation',
	'Schedule',
	'StartTrial',
	'SubmitApplication',
	'Subscribe',
]);

function isBrowser() {
	return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function isPixelConfigured() {
	return Boolean(META_PIXEL_ID && META_PIXEL_ID !== 'YOUR_PIXEL_ID');
}

function isTrackingAllowed() {
	if (!isBrowser()) return false;

	try {
		const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
		if (!preferences) return false;

		const parsed = JSON.parse(preferences);
		return parsed.analytics === true;
	} catch {
		return false;
	}
}

export function initPixel() {
	if (!isBrowser() || !isTrackingAllowed()) return;
	if (window.fbq) return;

	if (!isPixelConfigured()) {
		if (import.meta.env.DEV) {
			console.warn('Meta Pixel is not configured. Set VITE_META_PIXEL_ID in your environment.');
		}
		return;
	}

	!(function (f, b, e, v, n, t, s) {
		if (f.fbq) return;
		n = f.fbq = function () {
			n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
		};
		if (!f._fbq) f._fbq = n;
		n.push = n;
		n.loaded = true;
		n.version = '2.0';
		n.queue = [];
		t = b.createElement(e);
		t.async = true;
		t.src = v;
		s = b.getElementsByTagName(e)[0];
		s.parentNode.insertBefore(t, s);
	})(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

	window.fbq('init', META_PIXEL_ID);
}

export function trackPageView() {
	if (!isTrackingAllowed()) return;

	initPixel();
	if (window.fbq) {
		window.fbq('track', 'PageView');
	}
}

export function trackEvent(event, data = {}) {
	if (!isTrackingAllowed()) return;
	if (!event || typeof event !== 'string') return;

	initPixel();
	if (window.fbq) {
		// Meta recommends trackCustom for non-standard events.
		if (STANDARD_EVENTS.has(event)) {
			window.fbq('track', event, data);
		} else {
			window.fbq('trackCustom', event, data);
		}
	}
}
