/**
 * Scheduling utilities for GMT+1 timezone
 */

/**
 * Get current time in GMT+1 (West Africa Time)
 * @returns {Date} Current date/time in GMT+1
 */
export function getGMTPlus1Time() {
	const now = new Date();
	// GMT+1 offset in milliseconds (1 hour = 3600000 ms)
	const gmtPlus1Offset = 1 * 60 * 60 * 1000;
	const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
	const gmtPlus1Time = new Date(utcTime + gmtPlus1Offset);
	return gmtPlus1Time;
}

/**
 * Convert a local datetime string to GMT+1 ISO string
 * @param {string} dateTimeString - Local datetime string (YYYY-MM-DDTHH:mm format)
 * @returns {string} ISO string in GMT+1
 */
export function toGMTPlus1ISO(dateTimeString) {
	if (!dateTimeString) return null;
	
	// Parse the datetime string (assumes GMT+1 input, e.g., "2026-01-27T14:30")
	const [datePart, timePart] = dateTimeString.split('T');
	const [year, month, day] = datePart.split('-').map(Number);
	const [hours, minutes] = timePart ? timePart.split(':').map(Number) : [0, 0];
	
	// User selected time is in GMT+1, so we need to convert to UTC for storage
	// If user selects 14:30 GMT+1, that's 13:30 UTC
	// Create as UTC time, then subtract 1 hour
	const utcHours = hours - 1; // Convert GMT+1 to UTC
	const utcDate = new Date(Date.UTC(year, month - 1, day, utcHours, minutes));
	
	return utcDate.toISOString();
}

/**
 * Format GMT+1 ISO string to local datetime string for input
 * @param {string} isoString - ISO string
 * @returns {string} Local datetime string (YYYY-MM-DDTHH:mm format)
 */
export function fromGMTPlus1ISO(isoString) {
	if (!isoString) return '';
	
	const date = new Date(isoString);
	// Add 1 hour to convert from UTC to GMT+1
	const gmtPlus1Date = new Date(date.getTime() + (1 * 60 * 60 * 1000));
	
	const year = gmtPlus1Date.getUTCFullYear();
	const month = String(gmtPlus1Date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(gmtPlus1Date.getUTCDate()).padStart(2, '0');
	const hours = String(gmtPlus1Date.getUTCHours()).padStart(2, '0');
	const minutes = String(gmtPlus1Date.getUTCMinutes()).padStart(2, '0');
	
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Check if a scheduled post should be published
 * @param {string} scheduledAt - ISO string of scheduled time
 * @param {string} status - Current status (draft, scheduled, published)
 * @returns {boolean} True if should be published
 */
export function shouldPublish(scheduledAt, status) {
	if (!scheduledAt || status === 'published') return false;
	if (status !== 'scheduled') return false;
	
	const now = getGMTPlus1Time();
	const scheduled = new Date(scheduledAt);
	// Add 1 hour to scheduled time to convert from UTC to GMT+1 for comparison
	const scheduledGMTPlus1 = new Date(scheduled.getTime() + (1 * 60 * 60 * 1000));
	
	return now >= scheduledGMTPlus1;
}

/**
 * Get minimum datetime for scheduling (current time in GMT+1)
 * @returns {string} Minimum datetime string for input
 */
export function getMinScheduleDateTime() {
	const now = getGMTPlus1Time();
	const year = now.getUTCFullYear();
	const month = String(now.getUTCMonth() + 1).padStart(2, '0');
	const day = String(now.getUTCDate()).padStart(2, '0');
	const hours = String(now.getUTCHours()).padStart(2, '0');
	const minutes = String(now.getUTCMinutes()).padStart(2, '0');
	
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}
