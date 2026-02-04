# Fix: "The number of columns in the data does not match the number of columns in the range"

If you see this error when **publishing or scheduling** articles (or adding opportunities/tenders), your **deployed** Google Apps Script is still using the old code. It must use the **values** array sent by the app.

## What to do (required)

1. Open your **Google Sheet** (the one connected to BizGrowth admin).
2. Go to **Extensions** → **Apps Script**.
3. **Select all** existing code in the editor (Ctrl+A / Cmd+A) and **delete** it.
4. Open the file **`GoogleAppsScript_Code.js`** in this project folder. **Copy its entire contents** and **paste** into the Apps Script editor.
5. Click **Save** (disk icon).
6. Click **Deploy** → **Manage deployments**.
7. Click the **pencil (Edit)** on your existing deployment.
8. Under **Version**, choose **New version**.
9. Click **Deploy**.
10. Try publishing or scheduling an article again from the admin.

The script now **always builds each row from your sheet’s Row 1 headers + the payload `data`** (case‑insensitive). So `status` and `scheduledAt` always go into the correct columns, and the main site can show **published** / **scheduled** content correctly (no more “draft” when you publish).

---

## Optional: manual snippet (if you prefer to edit by hand)

Replace only the **append** and **update** logic with the version below (it uses `data.values[0]` when present).

### In the `doPost` function, use this for **append**:

```javascript
if (data.action === 'append') {
  // Prefer explicit values array (fixes "data has 1 but range has 14")
  let row;
  if (data.values && Array.isArray(data.values[0])) {
    row = data.values[0];
  } else {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    row = headers.map(header => {
      if (!header || header.trim() === '') return '';
      const key = header.trim();
      return data.data[key] ?? data.data[key.toLowerCase()] ?? '';
    });
  }
  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Row appended successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### And for **update**:

```javascript
if (data.action === 'update') {
  let row;
  if (data.values && Array.isArray(data.values[0])) {
    row = data.values[0];
  } else {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    row = headers.map(header => {
      if (!header || header.trim() === '') return '';
      const key = header.trim();
      return data.data[key] ?? data.data[key.toLowerCase()] ?? '';
    });
  }
  sheet.getRange(data.row + 1, 1, 1, row.length).setValues([row]);
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Row updated successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Deploy** → **Manage deployments** → pencil (Edit) → **Version** → **New version** → **Deploy**.

After this, publishing and scheduling from the admin should work. The app now sends an ordered `values` array so the script no longer depends on header names or column count from row 1.

## Sheet headers (Row 1)

**Row 1 must have one header per column** (spelling/case can vary; the script matches case‑insensitively). For Articles you need at least:

**Articles:**  
`title` | `slug` | `category` | `subheading` | `summary` | `content` | `image` | `heroImage` | `whyItMatters` | `publishedAt` | `author` | **`status`** | **`scheduledAt`** | `createdAt`

- **`status`** must be present: the app writes `published` or `scheduled` here. If this column is missing or misnamed, the site will treat the row as draft and won’t show it.
- **`scheduledAt`** is used for scheduled posts (ISO date/time).

If you had fewer columns before, add **status** and **scheduledAt** so new rows line up and the main site shows them.
