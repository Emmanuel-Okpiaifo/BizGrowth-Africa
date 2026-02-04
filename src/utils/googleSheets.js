/**
 * Google Sheets API Helper
 * For reading and writing content to Google Sheets
 */

import { getApiBaseUrl } from './apiBaseUrl';

// Google Sheets API configuration
// You'll need to set these in your environment or config
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '';

/**
 * Get data from a Google Sheet
 * @param {string} sheetName - Name of the sheet tab
 * @param {string} range - Range to read (e.g., 'A1:Z1000')
 * @returns {Promise<Array>} Array of rows
 */
export async function getSheetData(sheetName, range = 'A1:Z1000') {
	// Use PHP proxy to read from Google Sheets (server-side, avoids API restrictions)
	const apiBaseUrl = getApiBaseUrl();
	const proxyUrl = apiBaseUrl
		? `${apiBaseUrl}/api/google-sheets-read.php?sheet=${encodeURIComponent(sheetName)}&range=${encodeURIComponent(range)}`
		: `/api/google-sheets-read.php?sheet=${encodeURIComponent(sheetName)}&range=${encodeURIComponent(range)}`;

	try {
		const response = await fetch(proxyUrl);
		
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const errorMsg = errorData.error || `HTTP error: ${response.status}`;
			
			if (response.status === 403) {
				console.warn('Google Sheets API 403: Check that Google Sheets API is enabled in your Google Cloud project.');
				console.warn('Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com');
			}
			throw new Error(errorMsg);
		}

		const data = await response.json();

		if (!data.values || data.values.length === 0) {
			return [];
		}

		// First row is headers
		const headers = data.values[0];
		const rows = data.values.slice(1);

		// Convert to array of objects with lowercase keys (so title/Title/status/Status all work)
		const result = rows
			.map((row) => {
				const obj = {};
				headers.forEach((header, index) => {
					const cleanHeader = header ? header.trim() : '';
					const value = row[index] ?? '';
					obj[cleanHeader] = typeof value === 'string' ? value.trim() : value;
				});
				// Normalize keys to lowercase so hooks can use opp.title, opp.status regardless of sheet header case
				const normalized = {};
				Object.keys(obj).forEach((k) => {
					if (k) normalized[k.toLowerCase()] = obj[k];
				});
				return normalized;
			})
			.filter((row) => {
				// Filter out completely empty rows
				return Object.values(row).some(val => val != null && val.toString().trim() !== '');
			});

		return result;
	} catch (error) {
		console.error('Error fetching from Google Sheets:', error);
		// Rethrow so hooks can set error state and show a message (e.g. Opportunities page)
		throw error;
	}
}

// Column order for each sheet (must match Row 1 headers exactly for Apps Script fallback)
const ARTICLES_COLUMNS = ['title', 'slug', 'category', 'subheading', 'summary', 'content', 'image', 'heroImage', 'whyItMatters', 'publishedAt', 'author', 'status', 'scheduledAt', 'createdAt'];
const OPPORTUNITIES_COLUMNS = ['title', 'org', 'country', 'region', 'category', 'amountMin', 'amountMax', 'currency', 'deadline', 'postedAt', 'link', 'tags', 'featured', 'description', 'createdAt', 'status', 'scheduledAt', 'heroImage'];
const TENDERS_COLUMNS = ['title', 'agency', 'category', 'country', 'region', 'deadline', 'postedAt', 'link', 'description', 'eligibility', 'value', 'createdAt', 'status', 'scheduledAt', 'heroImage'];

function buildValuesRow(sheetName, data) {
	const columns = sheetName === 'Articles' ? ARTICLES_COLUMNS
		: sheetName === 'Opportunities' ? OPPORTUNITIES_COLUMNS
		: sheetName === 'Tenders' ? TENDERS_COLUMNS
		: null;
	if (!columns) return null;
	return columns.map((key) => {
		const v = data[key];
		if (v == null) return '';
		if (typeof v === 'object' && !Array.isArray(v)) return JSON.stringify(v);
		return String(v);
	});
}

/**
 * Append a row to a Google Sheet
 * Note: This requires Google Apps Script web app for write access
 * Sends both "data" (object) and "values" (ordered row array) so the script can append the correct number of columns.
 * @param {string} sheetName - Name of the sheet tab
 * @param {Object} data - Data object to append
 * @returns {Promise<boolean>} Success status
 */
export async function appendSheetRow(sheetName, data) {
	const apiBaseUrl = getApiBaseUrl();
	const proxyUrl = apiBaseUrl ? `${apiBaseUrl}/api/google-sheets-proxy.php` : '/api/google-sheets-proxy.php';
	const valuesRow = buildValuesRow(sheetName, data);
	const payload = {
		action: 'append',
		sheet: sheetName,
		data: data
	};
	if (valuesRow && valuesRow.length) {
		payload.values = [valuesRow];
	}
	try {
		const response = await fetch(proxyUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload)
		});

		// Get response text first
		const responseText = await response.text();
		console.log('Response from proxy:', responseText);
		console.log('Response status:', response.status);
		
		// Check if response is OK
		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status} - ${responseText}`);
		}
		
		// Try to parse as JSON
		let result;
		try {
			result = JSON.parse(responseText);
		} catch (e) {
			// If not JSON, it might be an error
			throw new Error(`Invalid JSON response: ${responseText}`);
		}

		// Check if the result indicates success
		if (result.success === true) {
			console.log('✅ Successfully appended row to Google Sheets');
			return true;
		}

		// If there's an error message, log it
		if (result.error) {
			console.error('❌ Google Apps Script error:', result.error);
			throw new Error(result.error);
		}

		// If success is false, that's an error
		if (result.success === false) {
			console.error('❌ Request failed:', result.error || 'Unknown error');
			throw new Error(result.error || 'Failed to save to Google Sheets');
		}

		// If we get here, the response format is unexpected
		console.warn('⚠️ Unexpected response format:', result);
		throw new Error(`Unexpected response format: ${responseText}`);
	} catch (error) {
		console.error('Error appending to Google Sheets:', error);
		console.error('Sheet name:', sheetName);
		console.error('Data:', data);
		return false;
	}
}

/**
 * Update a row in Google Sheet
 * @param {string} sheetName - Name of the sheet tab
 * @param {number} rowIndex - Row index (1-based)
 * @param {Object} data - Data object to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateSheetRow(sheetName, rowIndex, data) {
	const apiBaseUrl = getApiBaseUrl();
	const proxyUrl = apiBaseUrl ? `${apiBaseUrl}/api/google-sheets-proxy.php` : '/api/google-sheets-proxy.php';
	
	try {
		const response = await fetch(proxyUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				action: 'update',
				sheet: sheetName,
				row: rowIndex,
				data: data
			})
		});

		if (!response.ok) {
			throw new Error(`Failed to update row: ${response.status}`);
		}

		return true;
	} catch (error) {
		console.error('Error updating Google Sheets:', error);
		return false;
	}
}

/**
 * Delete a row from Google Sheet
 * @param {string} sheetName - Name of the sheet tab
 * @param {number} rowIndex - Row index (1-based, where 1 = first data row after header)
 * @returns {Promise<boolean>} Success status
 */
export async function deleteSheetRow(sheetName, rowIndex) {
	const apiBaseUrl = getApiBaseUrl();
	const proxyUrl = apiBaseUrl ? `${apiBaseUrl}/api/google-sheets-proxy.php` : '/api/google-sheets-proxy.php';
	
	try {
		const response = await fetch(proxyUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				action: 'delete',
				sheet: sheetName,
				row: rowIndex
			})
		});

		const responseText = await response.text();
		console.log('Delete response:', responseText);

		if (!response.ok) {
			throw new Error(`Failed to delete row: ${response.status} - ${responseText}`);
		}

		// Try to parse as JSON
		let result;
		try {
			result = JSON.parse(responseText);
		} catch (e) {
			throw new Error(`Invalid JSON response: ${responseText}`);
		}

		if (result.success === true) {
			console.log('✅ Successfully deleted row from Google Sheets');
			return true;
		}

		if (result.error) {
			console.error('❌ Google Apps Script error:', result.error);
			throw new Error(result.error);
		}

		return false;
	} catch (error) {
		console.error('Error deleting from Google Sheets:', error);
		return false;
	}
}
