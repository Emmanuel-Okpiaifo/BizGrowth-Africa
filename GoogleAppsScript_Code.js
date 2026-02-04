/**
 * BizGrowth Africa - Google Apps Script for Sheets (append/update/delete)
 *
 * COPY THIS ENTIRE FILE into your Google Sheet: Extensions → Apps Script.
 * Then: Deploy → Manage deployments → Edit (pencil) → New version → Deploy.
 *
 * Builds each row from the sheet's headers + data.data (case-insensitive)
 * so status, scheduledAt, etc. always land in the correct column and the
 * main site can show published/scheduled content correctly.
 */

function getRowFromData(sheet, data) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var obj = data.data || {};
  return headers.map(function(header) {
    if (!header || (header.trim && header.trim() === '')) return '';
    var key = (header.trim ? header.trim() : String(header));
    var val = obj[key];
    if (val === undefined || val === null) val = obj[key.toLowerCase()];
    if (val === undefined || val === null) return '';
    if (typeof val === 'object' && !(val instanceof Date)) return JSON.stringify(val);
    return String(val);
  });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.sheet);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found. Make sure you have a sheet named "' + data.sheet + '"'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'append') {
      // Always build row from sheet headers + data.data so status/scheduledAt go to the right column
      var row = getRowFromData(sheet, data);
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Row appended successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'update') {
      var row = getRowFromData(sheet, data);
      sheet.getRange(data.row + 1, 1, 1, row.length).setValues([row]);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Row updated successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'delete' && data.row != null) {
      sheet.deleteRow(data.row + 1);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Row deleted successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Invalid action. Use "append", "update", or "delete".'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    message: 'BizGrowth Africa Sheets API',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
