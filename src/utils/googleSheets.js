/**
 * Google Sheets API Helper
 * For reading and writing content to Google Sheets
 */

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
	const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://www.bizgrowthafrica.com';
	const proxyUrl = `${apiBaseUrl}/api/google-sheets-read.php?sheet=${encodeURIComponent(sheetName)}&range=${encodeURIComponent(range)}`;

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
		
		console.log('Google Sheets API Response:', data);
		
		if (!data.values || data.values.length === 0) {
			console.warn('No data values found in Google Sheets response');
			return [];
		}

		// First row is headers
		const headers = data.values[0];
		console.log('Headers:', headers);
		const rows = data.values.slice(1);
		console.log('Number of rows:', rows.length);

		// Convert to array of objects
		const result = rows
			.map((row, rowIndex) => {
				const obj = {};
				headers.forEach((header, index) => {
					// Trim header names to handle any whitespace
					const cleanHeader = header ? header.trim() : '';
					obj[cleanHeader] = row[index] || '';
				});
				console.log(`Row ${rowIndex + 1}:`, obj);
				return obj;
			})
			.filter((row, rowIndex) => {
				// Filter out completely empty rows
				const hasData = Object.values(row).some(val => val && val.toString().trim() !== '');
				if (!hasData) {
					console.log(`Row ${rowIndex + 1} is empty, skipping`);
				}
				return hasData;
			});
		
		console.log('Total articles parsed:', result.length);
		if (result.length > 0) {
			console.log('Sample article:', result[0]);
		}
		return result;
	} catch (error) {
		console.error('Error fetching from Google Sheets:', error);
		return [];
	}
}

/**
 * Append a row to a Google Sheet
 * Note: This requires Google Apps Script web app for write access
 * @param {string} sheetName - Name of the sheet tab
 * @param {Object} data - Data object to append
 * @returns {Promise<boolean>} Success status
 */
export async function appendSheetRow(sheetName, data) {
	// Use PHP proxy to avoid CORS issues with Google Apps Script
	// Use production API URL (works from both local and production)
	const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://www.bizgrowthafrica.com';
	const proxyUrl = `${apiBaseUrl}/api/google-sheets-proxy.php`;
	
	try {
		const response = await fetch(proxyUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				action: 'append',
				sheet: sheetName,
				data: data
			})
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
	// Use PHP proxy to avoid CORS issues with Google Apps Script
	// Use production API URL (works from both local and production)
	const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://www.bizgrowthafrica.com';
	const proxyUrl = `${apiBaseUrl}/api/google-sheets-proxy.php`;
	
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
