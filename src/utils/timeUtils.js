/**
 * Time utility functions for handling timezone-aware time calculations
 */

/**
 * Format createdAt for admin display: show date and time exactly as in the stored ISO string (no conversion).
 * e.g. "2026-02-07T02:21:57.954Z" → "2026-02-07, 02:21"
 * @param {string} createdAt - ISO date-time string from sheet/row
 * @returns {string}
 */
export function formatCreatedAt(createdAt) {
	if (!createdAt) return '—';
	try {
		const s = String(createdAt).trim();
		// Match ISO: YYYY-MM-DD then T or space, then HH:mm (optional :ss.ms and Z)
		const match = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
		if (match) {
			const [, y, m, d, hh, mm] = match;
			return `${y}-${m}-${d}, ${hh}:${mm}`;
		}
		const d = new Date(createdAt);
		if (isNaN(d.getTime())) return '—';
		// Fallback: format from UTC so time is not shifted by locale
		const pad = (n) => String(n).padStart(2, '0');
		const u = d.getUTCFullYear();
		const mo = d.getUTCMonth() + 1;
		const da = d.getUTCDate();
		const h = d.getUTCHours();
		const mi = d.getUTCMinutes();
		return `${u}-${pad(mo)}-${pad(da)}, ${pad(h)}:${pad(mi)}`;
	} catch {
		return '—';
	}
}

/**
 * Calculate time ago from a date string, handling timezone properly
 * @param {string} dateString - Date string (can be date-only or datetime)
 * @param {string} timezone - Timezone to interpret the date in (default: 'Africa/Lagos' for GMT+1)
 * @returns {string} Human-readable time ago string
 */
export function getTimeAgo(dateString, _timezone = 'Africa/Lagos') {
	if (!dateString) return 'Recently';
	
	let date;
	
	// Handle different date formats
	if (dateString.includes('T')) {
			// Has time component
			if (dateString.includes('+') || dateString.includes('Z')) {
				// Has timezone info - parse directly
				date = new Date(dateString);
			} else {
				// No timezone - assume it's in GMT+1 (Africa/Lagos)
				// Parse as GMT+1 time, then convert to UTC
				const [datePart, timePart] = dateString.split('T');
				const [year, month, day] = datePart.split('-').map(Number);
				const timeParts = timePart.split(':');
				const hours = Number(timeParts[0] || 0);
				const minutes = Number(timeParts[1] || 0);
				const seconds = Number(timeParts[2] || 0);
				
				// Convert GMT+1 to UTC (subtract 1 hour)
				// If it's 14:30 GMT+1, that's 13:30 UTC
				const utcHours = hours - 1;
				date = new Date(Date.UTC(year, month - 1, day, utcHours, minutes, seconds));
			}
		} else {
			// Date only (YYYY-MM-DD) - treat as midnight GMT+1
			const [year, month, day] = dateString.split('-').map(Number);
			// Midnight GMT+1 = 23:00 previous day UTC
			date = new Date(Date.UTC(year, month - 1, day - 1, 23, 0, 0));
		}
	
	const now = new Date();
	const diffMs = now - date;
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffHours / 24);
	
	if (diffMinutes < 1) return 'Just now';
	if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
	if (diffHours < 1) return 'Just now';
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
	
	const diffWeeks = Math.floor(diffDays / 7);
	if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
	
	const diffMonths = Math.floor(diffDays / 30);
	return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

/**
 * Get the appropriate date to use for time calculation based on status
 * @param {Object} item - Article/opportunity/tender object
 * @returns {Date|null} Date object or null
 */
export function getDateForTimeCalculation(item) {
	const status = (item.status || 'published').toLowerCase();
	
	if (status === 'published' && item.publishedAt) {
		// For published items, use publishedAt
		return parseDateWithTimezone(item.publishedAt);
	} else if (item.createdAt) {
		// For drafts/scheduled, use createdAt
		return new Date(item.createdAt);
	}
	
	return null;
}

/**
 * Parse a date string, handling GMT+1 timezone properly
 * @param {string} dateString - Date string
 * @returns {Date} Date object
 */
function parseDateWithTimezone(dateString) {
	if (!dateString) return new Date();
	
	if (dateString.includes('T')) {
		// Has time component
		if (dateString.includes('+') || dateString.includes('Z')) {
			// Has timezone info
			return new Date(dateString);
		} else {
			// No timezone - assume GMT+1
			const [datePart, timePart] = dateString.split('T');
			const [year, month, day] = datePart.split('-').map(Number);
			const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
			
			// Convert GMT+1 to UTC (subtract 1 hour)
			const utcHours = hours - 1;
			return new Date(Date.UTC(year, month - 1, day, utcHours, minutes, seconds));
		}
	} else {
		// Date only - treat as midnight GMT+1
		const [year, month, day] = dateString.split('-').map(Number);
		// Midnight GMT+1 = 23:00 previous day UTC
		return new Date(Date.UTC(year, month - 1, day - 1, 23, 0, 0));
	}
}
