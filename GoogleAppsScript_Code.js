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

/**
 * Auto-publish scheduled posts when their scheduled time has been reached.
 * Run this on a time-driven trigger (e.g. every 5 or 15 minutes) so status
 * changes from "scheduled" to "published" without the main website or cron.
 *
 * Set up trigger: In Apps Script editor → Triggers (clock icon) → Add Trigger
 * → Choose function: publishDueScheduledPosts
 * → Event: Time-driven → Minute timer → Every 5 minutes (or Every 15 minutes)
 * → Save
 */
function publishDueScheduledPosts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var now = new Date();
  var sheetNames = ['Articles', 'Opportunities', 'Tenders'];
  var timeZone = 'Africa/Lagos';
  var publishedAtValue = Utilities.formatDate(now, timeZone, "yyyy-MM-dd'T'HH:mm:ss'+01:00'");

  sheetNames.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) return;

    var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    var headers = data[0];
    var headersLower = headers.map(function(h) {
      return (h != null && h.toString) ? h.toString().trim().toLowerCase() : '';
    });
    var statusColIndex = headersLower.indexOf('status');
    var scheduledAtColIndex = headersLower.indexOf('scheduledat');
    var publishedAtColIndex = headersLower.indexOf('publishedat');
    if (statusColIndex === -1 || scheduledAtColIndex === -1) return;

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var status = (row[statusColIndex] != null && row[statusColIndex].toString) ? row[statusColIndex].toString().trim().toLowerCase() : '';
      var scheduledAt = (row[scheduledAtColIndex] != null && row[scheduledAtColIndex].toString) ? row[scheduledAtColIndex].toString().trim() : '';
      if (status !== 'scheduled' || !scheduledAt) continue;

      var scheduledDate;
      try {
        scheduledDate = new Date(scheduledAt);
      } catch (e) {
        continue;
      }
      if (isNaN(scheduledDate.getTime())) continue;
      if (now.getTime() < scheduledDate.getTime()) continue;

      var sheetRow = r + 1;
      sheet.getRange(sheetRow, statusColIndex + 1).setValue('published');
      if (publishedAtColIndex !== -1) {
        sheet.getRange(sheetRow, publishedAtColIndex + 1).setValue(publishedAtValue);
      }
    }
  });
}
