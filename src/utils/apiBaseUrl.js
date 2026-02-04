/**
 * Base URL for API requests (e.g. /api/market/*, /api/google-sheets-read.php).
 * When unset, uses same-origin so /api requests go to this server.
 * When on admin subdomain, API lives on main site.
 */
export function getApiBaseUrl() {
	const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
	if (base) return base;
	if (typeof window !== 'undefined' && window.location?.hostname) {
		const host = window.location.hostname.toLowerCase();
		if (host.startsWith('admin.') || host === 'admin') {
			const main = (import.meta.env.VITE_MAIN_SITE_URL || 'https://www.bizgrowthafrica.com').replace(/\/$/, '');
			return main;
		}
		return window.location.origin;
	}
	return '';
}
