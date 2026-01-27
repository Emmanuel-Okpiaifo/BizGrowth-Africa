// Updated Google Apps Script - Fixed version
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
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // Create row data matching headers
      const row = headers.map(header => {
        // Handle empty headers
        if (!header || header.trim() === '') {
          return '';
        }
        // Get the value from data object, or empty string if not found
        return data.data[header] || '';
      });
      
      // Append row
      sheet.appendRow(row);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true,
        message: 'Row appended successfully'
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'update') {
      // Get headers from row 1
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // Create row data matching headers
      const row = headers.map(header => {
        if (!header || header.trim() === '') {
          return '';
        }
        return data.data[header] || '';
      });
      
      // Update row (row index is 1-based, +1 for header row)
      sheet.getRange(data.row + 1, 1, 1, row.length).setValues([row]);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true,
        message: 'Row updated successfully'
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: 'Invalid action. Use "append" or "update"' 
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
