// Updated Google Apps Script - Fixed version with auto-column creation
// Copy and paste this entire code into your Apps Script editor

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.sheet);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Sheet not found. Make sure you have a sheet named "' + data.sheet + '"' 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'append') {
      // Get headers from row 1
      const lastColumn = sheet.getLastColumn();
      let headers = [];
      if (lastColumn > 0) {
        headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      }
      
      // Find missing columns and add them
      const dataKeys = Object.keys(data.data);
      const missingHeaders = [];
      
      dataKeys.forEach(key => {
        // Check if header exists (case-insensitive)
        const headerExists = headers.some(h => h && h.toString().trim().toLowerCase() === key.toLowerCase());
        if (!headerExists) {
          missingHeaders.push(key);
        }
      });
      
      // Add missing headers
      if (missingHeaders.length > 0) {
        const newColumnIndex = lastColumn + 1;
        const endColumn = newColumnIndex + missingHeaders.length - 1;
        sheet.getRange(1, newColumnIndex, 1, endColumn).setValues([missingHeaders]);
        // Update headers array
        headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      }
      
      // Create row data matching headers (case-insensitive matching)
      const row = headers.map(header => {
        // Handle empty headers
        if (!header || header.trim() === '') {
          return '';
        }
        // Find matching key in data (case-insensitive)
        const headerLower = header.toString().trim().toLowerCase();
        const matchingKey = Object.keys(data.data).find(k => k.toLowerCase() === headerLower);
        // Preserve the value exactly as sent, including empty strings, null, etc.
        // Only use empty string if the key doesn't exist at all
        if (matchingKey !== undefined) {
          const value = data.data[matchingKey];
          // Preserve null, undefined, empty string, 0, false - all valid values
          return value !== undefined && value !== null ? value : '';
        }
        return '';
      });
      
      // Append row
      sheet.appendRow(row);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true,
        message: 'Row appended successfully',
        addedColumns: missingHeaders.length > 0 ? missingHeaders : []
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'update') {
      // Get headers from row 1
      const lastColumn = sheet.getLastColumn();
      let headers = [];
      if (lastColumn > 0) {
        headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      }
      
      // Find missing columns and add them
      const dataKeys = Object.keys(data.data);
      const missingHeaders = [];
      
      dataKeys.forEach(key => {
        // Check if header exists (case-insensitive)
        const headerExists = headers.some(h => h && h.toString().trim().toLowerCase() === key.toLowerCase());
        if (!headerExists) {
          missingHeaders.push(key);
        }
      });
      
      // Add missing headers
      if (missingHeaders.length > 0) {
        const newColumnIndex = lastColumn + 1;
        const endColumn = newColumnIndex + missingHeaders.length - 1;
        sheet.getRange(1, newColumnIndex, 1, endColumn).setValues([missingHeaders]);
        // Update headers array
        headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      }
      
      // Create row data matching headers (case-insensitive matching)
      // For updates, we need to preserve existing values and only update specified fields
      const row = headers.map(header => {
        if (!header || header.trim() === '') {
          return '';
        }
        // Find matching key in data (case-insensitive)
        const headerTrimmed = header.toString().trim();
        const headerLower = headerTrimmed.toLowerCase();
        const matchingKey = Object.keys(data.data).find(k => k.toLowerCase() === headerLower);
        
        // If we have a matching key in the update data, use that value
        if (matchingKey !== undefined) {
          const value = data.data[matchingKey];
          // Preserve null, undefined, empty string, 0, false - all valid values
          // But convert null/undefined to empty string for Google Sheets
          return value !== undefined && value !== null ? value : '';
        }
        
        // If no matching key, return empty string (will be filled from existing row if updating)
        return '';
      });
      
      // Update row (row index is 1-based, +1 for header row)
      sheet.getRange(data.row + 1, 1, 1, row.length).setValues([row]);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true,
        message: 'Row updated successfully',
        addedColumns: missingHeaders.length > 0 ? missingHeaders : []
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'delete') {
      // Delete row (row index is 1-based, where 1 = first data row after header)
      // So we need to add 1 to account for header row
      const sheetRow = data.row + 1;
      
      // Check if row exists
      if (sheetRow > sheet.getLastRow()) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false,
          error: 'Row index out of range'
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Delete the row
      sheet.deleteRow(sheetRow);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true,
        message: 'Row deleted successfully'
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: 'Invalid action. Use "append", "update", or "delete"' 
    }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    message: 'Google Sheets API is running',
    timestamp: new Date().toISOString()
  }))
    .setMimeType(ContentService.MimeType.JSON);
}
