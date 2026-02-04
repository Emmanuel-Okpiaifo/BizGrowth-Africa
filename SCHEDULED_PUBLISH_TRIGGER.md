# Auto-publish scheduled posts when time is reached

Scheduled posts change from **scheduled** to **published** only when:

1. **Google Sheets (automatic)** – A time-driven trigger runs `publishDueScheduledPosts()` every few minutes inside your Google Sheet. When the clock reaches a post’s scheduled time, the next run updates it to published. **No main website involved.**

2. **Admin dashboard (manual)** – You click **“Publish Scheduled”** on the admin dashboard to run the check once.

The **main news website does not trigger** publishing.

---

## Set up the automatic trigger (one-time)

1. Open your **Google Sheet** (the one used for Articles/Opportunities/Tenders).
2. Go to **Extensions** → **Apps Script**.
3. Make sure the script includes the function **`publishDueScheduledPosts`** (it’s in `GoogleAppsScript_Code.js`).
4. In the Apps Script editor, click the **clock icon** (**Triggers**) in the left sidebar.
5. Click **+ Add Trigger** (bottom right).
6. Set:
   - **Choose function:** `publishDueScheduledPosts`
   - **Choose deployment:** Head
   - **Select event source:** Time-driven
   - **Select type of time-based trigger:** Minute timer
   - **Select minute interval:** Every 5 minutes (or Every 15 minutes)
7. Click **Save**.
8. If asked, authorize the script (your Google account).

After this, the script will run every 5 (or 15) minutes. Any row with **status** = `scheduled` and **scheduledAt** ≤ current time will be updated to **status** = `published` and **publishedAt** = now. The main website is not used for this.
