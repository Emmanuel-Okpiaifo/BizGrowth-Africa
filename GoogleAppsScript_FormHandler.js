/**
 * BizGrowth Africa - Membership & Newsletter form handler
 *
 * Same Google Spreadsheet, two sheets: "Membership" and "Newsletter".
 * The request body includes a "form" (or "formType") field; use it to decide which sheet to append to.
 * After appending to the sheet, the same payload is forwarded to Zoho Flow webhook.
 *
 * SETUP:
 * 1. In the same spreadsheet that has "Membership" and "Newsletter" sheets, open Extensions → Apps Script.
 * 2. Replace or add this code so doPost handles the form webhook.
 * 3. Deploy as Web app: Deploy → New deployment → Type: Web app → Execute as: Me, Who has access: Anyone.
 * 4. Copy the web app URL and use it in MembershipForm.jsx and Footer.jsx (webhookUrl).
 *
 * SHEET NAMES: Must match exactly — "Membership" and "Newsletter".
 * ROW 1 of each sheet = headers (e.g. form, formType, ts, firstName, lastName, email, …). Incoming payload keys (lowercase-matched) fill the columns.
 */

var ZOHO_WEBHOOK_URL = 'https://flow.zoho.com/914809505/flow/webhook/incoming?zapikey=1001.9cdf0a2d4b94899d479d0ef38486c1ad.b92d6c920b34354d3acc2211f2166377&isdebug=false';

function getRowFromPayload(sheet, payload) {
  if (!sheet || typeof sheet.getRange !== 'function') return [];
  var lastCol = sheet.getLastColumn();
  if (!lastCol || lastCol < 1) return [];
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  if (!payload || typeof payload !== 'object') payload = {};
  return headers.map(function(header) {
    if (!header || (String(header).trim && String(header).trim() === '')) return '';
    var key = (header.trim ? header.trim() : String(header));
    var keyLower = (key.toLowerCase ? key.toLowerCase() : String(key).toLowerCase());
    var val = payload[key];
    if (val === undefined || val === null) val = payload[keyLower];
    if (val === undefined || val === null) return '';
    if (typeof val === 'object' && !(val instanceof Date)) return JSON.stringify(val);
    return String(val);
  });
}

/**
 * Map incoming "form" or "formType" value to sheet name.
 * Existing sheet uses: "membership" / "waitlist" → Membership, "newsletter" → Newsletter.
 */
function getSheetNameForForm(payload) {
  if (!payload || typeof payload !== 'object') return 'Membership';
  var form = (payload.form || payload.formType || '').toString().trim().toLowerCase();
  if (form === 'newsletter') return 'Newsletter';
  if (form === 'membership' || form === 'waitlist' || form === '') return 'Membership';
  return 'Membership';
}

function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        var parsed = JSON.parse(e.postData.contents);
        if (parsed && typeof parsed === 'object') payload = parsed;
      } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid JSON body'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var sheetName = getSheetNameForForm(payload);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found: "' + sheetName + '". Create sheets named "Membership" and "Newsletter" in this spreadsheet.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var row = getRowFromPayload(sheet, payload);
    sheet.appendRow(row);

    // Forward same payload to Zoho Flow (fire-and-forget; failures don't affect response)
    if (ZOHO_WEBHOOK_URL && payload && typeof payload === 'object') {
      try {
        UrlFetchApp.fetch(ZOHO_WEBHOOK_URL, {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
      } catch (zohoErr) {
        // Log but don't fail the request — sheet was already updated
        Logger.log('Zoho forward error: ' + zohoErr);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Saved to ' + sheetName
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
    message: 'BizGrowth Africa Form Handler (Membership & Newsletter)',
    sheets: ['Membership', 'Newsletter'],
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test Zoho Flow webhook (Run from editor: Run → testZohoWebhook).
 * Sends a sample payload to the Zoho webhook URL.
 */
function testZohoWebhook() {
  var data = {
    form: 'membership',
    formType: 'membership',
    ts: new Date().toISOString(),
    email: 'test+flow@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    phone: '+2348012345678',
    country: 'Nigeria',
    interest: 'Business',
    page: 'https://example.com/homepage',
    userAgent: 'Apps Script test'
  };

  var response = UrlFetchApp.fetch(ZOHO_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  });

  Logger.log('Zoho response code: ' + response.getResponseCode());
  Logger.log('Zoho response: ' + response.getContentText());
}
