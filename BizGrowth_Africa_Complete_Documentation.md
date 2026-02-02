# BizGrowth Africa - Complete Documentation & Setup Guide

**Version:** 2.0  
**Last Updated:** January 2026  
**Website:** https://bizgrowthafrica.com

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Initial Setup & Installation](#initial-setup--installation)
6. [Google Sheets CMS Setup](#google-sheets-cms-setup)
7. [Admin Panel Guide](#admin-panel-guide)
8. [Admin Subdomain Setup](#admin-subdomain-setup)
9. [Post Scheduling Setup](#post-scheduling-setup)
10. [Website Features & Functionalities](#website-features--functionalities)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)
13. [Maintenance & Updates](#maintenance--updates)
14. [Additional Features & Functionalities](#additional-features--functionalities)

---

## Introduction

BizGrowth Africa is a comprehensive business intelligence platform designed specifically for African MSMEs (Micro, Small, and Medium Enterprises). The platform provides curated news, funding opportunities, procurement tenders, market updates, and practical resources to help businesses make informed decisions and achieve sustainable growth.

### Key Objectives
- Deliver original, actionable business news for African entrepreneurs
- Provide a centralized platform for funding opportunities and tenders
- Offer market intelligence and data-driven insights
- Create a community space for African businesses
- Enable non-technical users to manage content through an intuitive admin panel

---

## System Overview

### Architecture
The platform consists of two main components:

1. **Frontend Website** (React SPA)
   - Public-facing website with news, opportunities, tenders, and resources
   - Responsive design with dark mode support
   - SEO-optimized pages
   - Google Analytics 4 integration

2. **Admin Panel** (React SPA)
   - Content management system for non-technical users
   - Google Sheets-based CMS (no database required)
   - Rich text editor for content creation
   - Real-time analytics dashboard

### Content Management System
The platform uses **Google Sheets as a CMS**, eliminating the need for a traditional database. This approach:
- Requires no backend database setup
- Allows non-technical users to manage content
- Provides real-time content updates
- Works seamlessly with cPanel hosting

---

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS 3** - Utility-first CSS framework
- **Lucide React** - Icon library
- **FontAwesome** - Additional icons

### Admin Panel
- **Tiptap** - Rich text editor (React 19 compatible)
  - `@tiptap/react`
  - `@tiptap/starter-kit`
  - `@tiptap/extension-image`

### Backend/API
- **PHP** - Server-side API endpoints
  - Google Sheets proxy
  - Image upload handler
  - Contact form handler
  - Market data API

### External Services
- **Google Sheets API** - Content storage
- **Google Apps Script** - Write operations to Sheets
- **Google Analytics 4** - Website analytics
- **Ninth Grid** - Afro-centric image source
- **Unsplash** - Image fallbacks

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## Project Structure

```
BizGrowth Africa/
├── api/                          # PHP API endpoints
│   ├── _lib/                     # PHP utilities
│   │   ├── response.php          # JSON response helpers
│   │   └── providers/            # Market data providers
│   ├── contact.php               # Contact form handler
│   ├── google-sheets-proxy.php   # Write operations proxy
│   ├── google-sheets-read.php    # Read operations proxy
│   ├── upload-image.php          # Image upload handler
│   └── market/                   # Market data endpoints
├── public/                        # Static assets
│   ├── favicon.png
│   ├── robots.txt
│   ├── sitemap.xml
│   └── _redirects               # Netlify redirects
├── src/
│   ├── assets/                   # Images and logos
│   ├── components/               # React components
│   │   ├── admin/               # Admin-specific components
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── RichTextEditor.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   ├── NewsCard.jsx
│   │   └── ... (other components)
│   ├── config/
│   │   └── site.js              # Site configuration
│   ├── data/                     # Static data and generators
│   │   ├── articles.original.js
│   │   ├── originals.bulk.js
│   │   ├── originals.index.js
│   │   └── ...
│   ├── hooks/                    # React hooks
│   │   ├── useGoogleSheetsArticles.js
│   │   ├── useGoogleSheetsOpportunities.js
│   │   ├── useGoogleSheetsTenders.js
│   │   └── ...
│   ├── pages/                    # Page components
│   │   ├── admin/               # Admin pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminArticles.jsx
│   │   │   ├── AdminArticlesEdit.jsx
│   │   │   ├── AdminArticlesList.jsx
│   │   │   ├── AdminOpportunities.jsx
│   │   │   └── AdminTenders.jsx
│   │   ├── Home.jsx
│   │   ├── NewsInsights.jsx
│   │   ├── NewsArticle.jsx
│   │   └── ... (other pages)
│   ├── utils/                    # Utility functions
│   │   ├── analytics.js          # GA4 helpers
│   │   ├── googleSheets.js       # Sheets API helpers
│   │   └── imageUpload.js        # Image upload utilities
│   ├── App.jsx                   # Main app with routes
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── .env                          # Environment variables
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
└── tailwind.config.js           # Tailwind configuration
```

---

## Initial Setup & Installation

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **npm** or **yarn**
- **PHP 7.4+** (for local development with API)
- **Git** (for version control)

### Step 1: Clone/Download Project
```bash
# If using Git
git clone <repository-url>
cd "BizGrowth Africa"

# Or extract the project folder
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- React and React DOM
- React Router
- Tailwind CSS
- Tiptap editor
- Lucide React icons
- FontAwesome icons
- And all development dependencies

### Step 3: Environment Configuration
Create a `.env` file in the project root:

```env
# Google Sheets Configuration
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# API Base URL (for production)
VITE_API_BASE_URL=https://www.bizgrowthafrica.com
```

**Note:** You'll get these values after setting up Google Sheets (see next section).

### Step 4: Install PHP (For Local Development)

**Note:** PHP is required for API endpoints (image uploads, Google Sheets operations).

#### Windows Installation

1. **Download PHP:**
   - Go to: https://windows.php.net/download/
   - Download latest stable version (Thread Safe, ZIP file)
   - Example: `php-8.3.x-Win32-vs16-x64.zip`

2. **Extract PHP:**
   - Extract to: `C:\php`
   - Ensure `php.exe` is at `C:\php\php.exe`

3. **Add PHP to PATH:**
   - Press `Win + X` → **"System"** → **"Advanced system settings"**
   - Click **"Environment Variables"**
   - Under **"System variables"**, find `Path` → **"Edit"**
   - Click **"New"** → Add: `C:\php`
   - Click **"OK"** on all dialogs

4. **Enable Required Extensions:**
   - In `C:\php`, copy `php.ini-development` → rename to `php.ini`
   - Open `php.ini` in text editor
   - Uncomment (remove `;` from):
     ```ini
     extension=curl
     extension=openssl
     extension=mbstring
     ```

5. **Verify Installation:**
   ```bash
   php -v
   ```
   Should show PHP version information.

**Alternative:** Use XAMPP or WAMP (includes PHP automatically).

### Step 5: Run Development Server

#### Main Website
```bash
# Start Vite dev server
npm run dev

# In another terminal, start PHP server (for API)
npm run dev:php

# Or run both together
npm run dev:all
```

The website will be available at `http://localhost:5173`

#### Admin Panel (Local Development)

**Option 1: Admin Dev Server (Recommended)**
```bash
# Terminal 1: Start PHP server
npm run dev:php

# Terminal 2: Start Admin dev server
npm run dev:admin
```

**Option 2: Build and Preview (If Dev Mode Shows Blank)**
```bash
# Build the admin panel
npm run build:admin

# Preview the built admin panel
npm run preview:admin
```

**Access Admin Panel:**
- URL: `http://localhost:5173` (or port shown)
- Username: `Admin` | Password: `]ofcwrD-!13+{v_P`
- Username: `Adeola` | Password: `;4WcxRwb5&VEjPFu`

**Note:** If `npm run dev:admin` shows blank page, use the build + preview approach.

### Step 6: Build for Production

#### Main Website
```bash
npm run build
```
Creates optimized production build in `dist/` folder.

#### Admin Panel
```bash
npm run build:admin
```
Creates admin-only build in `dist-admin/` folder.

---

## Google Sheets CMS Setup

### Overview
The platform uses Google Sheets as a Content Management System. This eliminates the need for a traditional database and allows non-technical users to manage content easily.

### Step 1: Create Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "BizGrowth Africa CMS" (or any name you prefer)
4. Create three sheets/tabs:
   - **Articles** - For news articles
   - **Opportunities** - For grants and funding opportunities
   - **Tenders** - For procurement tenders

### Step 2: Set Up Sheet Headers

#### Articles Sheet
Add these column headers in **Row 1** (exact spelling matters):
```
title | slug | category | subheading | summary | content | image | publishedAt | author | createdAt
```

**Field Descriptions:**
- `title` - Article headline
- `slug` - URL-friendly version (auto-generated from title)
- `category` - One of: Fintech, Policy, Funding, Markets, SMEs, Reports
- `subheading` - Brief subheading
- `summary` - Article summary/description
- `content` - Full article content (HTML from rich text editor)
- `image` - Image URL
- `publishedAt` - Publication date (YYYY-MM-DD format)
- `author` - Author name (default: "BizGrowth Africa Editorial")
- `createdAt` - Creation timestamp (ISO format)

#### Opportunities Sheet
Add these column headers in **Row 1**:
```
title | org | country | region | category | amountMin | amountMax | currency | deadline | postedAt | link | tags | featured | description | createdAt
```

**Field Descriptions:**
- `title` - Opportunity title
- `org` - Organization name
- `country` - Country name
- `region` - Region (West Africa, East Africa, etc.)
- `category` - Grant, Accelerator, Competition, Fellowship, Training, Impact Loan
- `amountMin` - Minimum funding amount (number)
- `amountMax` - Maximum funding amount (number)
- `currency` - Currency code (USD, NGN, etc.)
- `deadline` - Application deadline (YYYY-MM-DD)
- `postedAt` - Posting date (YYYY-MM-DD)
- `link` - Application link URL
- `tags` - Comma-separated tags or JSON array
- `featured` - true/false (string)
- `description` - Full description (HTML)
- `createdAt` - Creation timestamp

#### Tenders Sheet
Add these column headers in **Row 1**:
```
title | agency | category | country | region | deadline | postedAt | link | description | eligibility | value | createdAt
```

**Field Descriptions:**
- `title` - Tender title
- `agency` - Agency/organization name
- `category` - Tender category
- `country` - Country name
- `region` - Region
- `deadline` - Submission deadline (YYYY-MM-DD)
- `postedAt` - Posting date (YYYY-MM-DD)
- `link` - Tender link URL
- `description` - Full description (HTML)
- `eligibility` - Eligibility requirements
- `value` - Tender value
- `createdAt` - Creation timestamp

### Step 3: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google Sheets API**:
   - Navigate to: https://console.cloud.google.com/apis/library/sheets.googleapis.com
   - Click **"Enable"**
   - Wait for it to enable (usually takes a few seconds)

4. Create API Key:
   - Go to **APIs & Services** → **Credentials**
   - Click **"Create Credentials"** → **"API Key"**
   - Copy the API key
   - (Optional) Restrict the API key to Google Sheets API only

### Step 4: Make Spreadsheet Publicly Readable

**IMPORTANT:** The spreadsheet must be publicly readable for the API to work.

1. Open your Google Sheet
2. Click the **"Share"** button (top-right)
3. Change sharing settings:
   - Click on **"Restricted"** dropdown
   - Select **"Anyone with the link"**
   - Set permission to **"Viewer"** (not Editor)
4. Click **"Done"**

**Note:** This allows the API to read your sheet. Write access is handled separately via Apps Script.

### Step 5: Set Up Google Apps Script (For Write Access)

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete the default code
3. Paste the following code:

```javascript
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
        if (!header || header.trim() === '') {
          return '';
        }
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
```

4. Click **"Deploy"** → **"New deployment"**
5. Select type: **"Web app"**
6. Configure:
   - Description: "BizGrowth CMS API"
   - Execute as: **"Me"**
   - Who has access: **"Anyone"** (required for CORS)
7. Click **"Deploy"**
8. **Copy the Web app URL** - you'll need this for `.env`

### Step 6: Get Spreadsheet ID

1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3. Copy the `SPREADSHEET_ID` part (the long string between `/d/` and `/edit`)

### Step 7: Update Environment Variables

Update your `.env` file with the actual values:

```env
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyBZfPhyU2ktSlkkqr2KQsvyO20_Af5Wg40
VITE_GOOGLE_SHEETS_ID=1UvV9_w8UDXcDC1G8_p6Z0TWj5O7W9_DXPBcCNHMwr7w
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_API_BASE_URL=https://www.bizgrowthafrica.com
```

**Replace:**
- `YOUR_SCRIPT_ID` with the actual script ID from your Apps Script deployment
- Use your actual API key and Spreadsheet ID

### Step 8: Test the Setup

1. Restart your dev server: `npm run dev`
2. Navigate to `/admin` in your browser
3. Try creating an article, opportunity, or tender
4. Check your Google Sheet - the data should appear!

---

## Admin Panel Guide

### Accessing the Admin Panel

#### Production Access (Subdomain)

The admin panel is hosted on a separate subdomain: `https://admin.bizgrowthafrica.com`

**Setup Requirements:**
1. Create subdomain in cPanel: `admin.bizgrowthafrica.com`
2. Point subdomain to separate folder (e.g., `public_html/admin`)
3. Build admin panel: `npm run build:admin`
4. Upload contents of `dist-admin/` to subdomain folder
5. Upload `.htaccess` file for SPA routing
6. Set up authentication (see Authentication section below)

#### Local Development Access

See **Step 5** in Initial Setup section for localhost access instructions.

### Admin Authentication

The admin panel uses **client-side authentication** with multiple users.

#### Current Admin Users

Configured in `src/utils/adminAuth.js`:

1. **Username:** `Admin`  
   **Password:** `]ofcwrD-!13+{v_P`

2. **Username:** `Adeola`  
   **Password:** `;4WcxRwb5&VEjPFu`

#### How It Works

- ✅ Prompts for username and password on **every new tab**
- ✅ Clears authentication when **tab is closed** (uses `sessionStorage`)
- ✅ Supports multiple admin users
- ✅ Clean, custom login interface

#### Adding or Changing Users

1. Edit `src/utils/adminAuth.js`:
   ```javascript
   const ADMIN_USERS = [
     {
       username: 'Admin',
       password: 'your_password_here'
     },
     {
       username: 'Adeola',
       password: 'another_password_here'
     },
     // Add more users here
   ];
   ```

2. Rebuild admin panel:
   ```bash
   npm run build:admin
   ```

3. Upload new build to subdomain

**Security Note:** User credentials are compiled into the JavaScript bundle. For production, consider moving to environment variables or a secure API.

#### Authentication Options

**Option A: Client-Side Only (Recommended)**
- Single password prompt
- Password clears when tab closes
- Better user experience
- Remove HTTP Basic Auth from cPanel

**Option B: Both Layers (Maximum Security)**
- HTTP Basic Auth (cPanel password protection) + Client-side login
- Two password prompts
- More secure but less user-friendly
- Keep HTTP Basic Auth enabled in cPanel

### Admin Dashboard

The dashboard (`/admin`) provides:
- **Real-time Statistics:**
  - Total Articles
  - Total Opportunities
  - Active Tenders
  - Articles Published Today
- **Analytics Overview:**
  - Articles This Month (with trend)
  - Top Category
  - New Opportunities This Month
  - Total Categories
- **Quick Actions:**
  - Create Article
  - Add Opportunity
  - Post Tender
- **Recent Activity:**
  - Shows recent articles, opportunities, and tenders
- **News Articles Summary:**
  - List of recent articles with quick links

### Creating Articles

1. Navigate to `/articles/new` (or click "Create Article" from dashboard)
2. Fill in the form:
   - **Title** (required) - Auto-generates slug
   - **Slug** - Can be edited manually
   - **Category** (required) - Select from dropdown
   - **Hero Image (Banner)** - Upload or paste URL for hero section image
   - **Image URL** - External image URL (for article content)
   - **Subheading** - Brief subheading
   - **Summary** - Article summary
   - **Content** (required) - Use rich text editor
   - **Published Date** - Select date
   - **Publish Options:**
     - **Publish Now** - Immediately publish
     - **Schedule Post** - Set date/time (GMT+1) for future publishing
     - **Save as Draft** - Save locally without publishing

3. Click **"Save Article"**, **"Schedule Post"**, or **"Save as Draft"**
4. Published articles appear in Google Sheets and on website immediately
5. Scheduled posts appear after their scheduled time
6. Drafts are saved locally and can be edited later

### Editing Articles

1. Go to `/articles` (Articles List)
2. Find the article you want to edit
3. Click **"Edit"** button
4. Modify any fields
5. Click **"Update Article"**
6. Changes are saved to Google Sheets

**Note:** Drafts can be edited by clicking "Edit" on draft items. Editing a draft updates the existing draft and does not create a new entry.

### Rich Text Editor Features

The editor supports:
- **Text Formatting:**
  - Bold, Italic, Underline
  - Headings (H1, H2, H3)
  - Bullet lists, Numbered lists
  - Blockquotes
- **Image Insertion:**
  - Upload images (server-side)
  - Or use external image URLs
  - Images organized by type (articles, opportunities, tenders)
- **Content Structure:**
  - Paragraphs
  - Links
  - Code blocks

### Image Upload

#### Hero Image Upload (Banner Image)

1. In the article/opportunity/tender form, find **"Hero Image (Banner)"** section
2. Choose:
   - **Upload Image:** Click "Upload Hero Image" button
     - Select file from computer
     - Supported: JPG, PNG, WebP
     - Max size: 5MB
     - Images saved to `public_html/uploads/[type]/`
     - Returns absolute URL (e.g., `https://www.bizgrowthafrica.com/uploads/articles/filename.jpg`)
   - **Image URL:** Paste external image URL directly
3. Preview appears immediately after upload
4. Hero image displays in hero section/banner on main website (not inside article content)

#### Content Image Upload (Rich Text Editor)

1. In the rich text editor, click the image icon
2. Choose:
   - **Upload Image:** Select file from computer
     - Supported: JPG, PNG, WebP
     - Max size: 5MB
     - Images saved to `public_html/uploads/[type]/`
     - Organized by type: articles, opportunities, tenders
   - **Image URL:** Paste external image URL
     - Validates URL before inserting
3. Image appears in editor immediately

**Image Storage:**
- Server-side uploads: `public_html/uploads/[type]/[filename]`
- URLs are absolute: `https://www.bizgrowthafrica.com/uploads/...`
- Images are organized by content type
- `.htaccess` excludes `/uploads/` from SPA routing for direct file access

### Creating Opportunities

1. Navigate to `/opportunities/new` (or click "Create Opportunity" from any admin page)
2. Fill in the form:
   - **Hero Image (Banner)** - Upload or paste URL for hero section image
   - **Title** (required)
   - **Organization**
   - **Country**
   - **Region**
   - **Category**
   - **Amount Min/Max**
   - **Currency**
   - **Deadline**
   - **Posted Date**
   - **Link**
   - **Tags** (comma-separated)
   - **Featured** (checkbox)
   - **Description** (rich text editor)
3. Click **"Save Opportunity"**

### Creating Tenders

1. Navigate to `/tenders/new` (or click "Create Tender" from any admin page)
2. Fill in the form:
   - **Hero Image (Banner)** - Upload or paste URL for hero section image
   - **Title** (required)
   - **Agency**
   - **Category**
   - **Country**
   - **Region**
   - **Deadline**
   - **Posted Date**
   - **Link**
   - **Description** (rich text editor)
   - **Eligibility**
   - **Value**
3. Click **"Save Tender"**

### Draft Management

**Save as Draft:**
- Drafts are saved to browser `localStorage` (client-side)
- Drafts do NOT appear in Google Sheets until published
- Drafts do NOT appear on main website
- Drafts persist until published or deleted

**Editing Drafts:**
- View drafts in list pages (marked with "Draft" badge)
- Click "Edit" on draft to continue editing
- Editing a draft updates the existing draft (does not create new entry)
- Can publish or schedule drafts at any time

**Draft Storage:**
- Location: Browser `localStorage`
- Key format: `drafts_[type]_[id]`
- Types: `articles`, `opportunities`, `tenders`
- Auto-refreshes every 5 seconds to catch updates

### Post Scheduling

**Schedule Posts:**
1. When creating/editing article/opportunity/tender
2. Check **"Schedule this post for later"**
3. Select date and time (GMT+1 timezone)
4. Click **"Schedule Post"**
5. Post is saved with `status: 'scheduled'` and `scheduledAt` timestamp

**How Scheduling Works:**
- Scheduled posts are stored in Google Sheets with `status: 'scheduled'`
- `scheduledAt` is stored as UTC ISO string
- Scheduled posts are automatically filtered from public view until scheduled time
- Client-side filtering prevents premature display

**Publishing Scheduled Posts:**

**Option 1: Manual Publishing (Admin Dashboard)**
1. Go to admin dashboard
2. Click **"Publish Scheduled"** button
3. System checks all sheets and publishes posts whose time has arrived
4. Status updates from `scheduled` to `published`
5. `publishedAt` is set to current datetime (GMT+1)

**Option 2: Automatic Publishing (Cron Job - Recommended)**
- Set up cron job to call: `https://www.bizgrowthafrica.com/api/publish-scheduled.php`
- Frequency: Every 5-15 minutes
- Cron job automatically publishes scheduled posts when time arrives

**See "Post Scheduling Setup" section below for detailed cron job setup.**

### Status Management

**Post Statuses:**
- **Published** - Visible on main website
- **Scheduled** - Will be published at scheduled time
- **Draft** - Saved locally, not visible on website

**Status Display:**
- Admin list pages show status badges (Published/Scheduled/Draft)
- Scheduled posts show scheduled date/time
- Auto-refresh every 30 seconds to catch status updates
- Manual refresh button available

### Admin Panel Features

- **Dark Mode Toggle:** Available in navbar (visible on all screen sizes)
- **Mobile Responsive:** Works on all screen sizes
- **Real-time Data:** Fetches latest data from Google Sheets
- **Auto-refresh:** List pages refresh every 30 seconds
- **Error Handling:** Graceful error messages
- **Loading States:** Shows loading indicators during data fetch
- **Delete Functionality:** Delete articles/opportunities/tenders (removes from Google Sheets)
- **View Functionality:** "View" button navigates to article/opportunity/tender on main website

---

## Website Features & Functionalities

### Main Website Pages

#### 1. Home Page (`/`)
**Features:**
- Hero section with featured article
- Side headlines (4 articles)
- Trending Stories section
- Markets Strip (live market data)
- Opportunities & Tenders preview
- Homepage CTA bar

**Content Sources:**
- Combines Google Sheets articles with static articles
- Prioritizes Google Sheets content
- Falls back to static content if Sheets unavailable

#### 2. News & Insights (`/news-insights`)
**Features:**
- Full article listing
- Category filters
- Search functionality
- Pagination
- SEO optimized

**Displays:**
- First 3 articles from Google Sheets
- Falls back to static articles if needed

#### 3. News Article Page (`/news/:slug`)
**Features:**
- Full article display
- Rich HTML content from editor
- Related articles section
- Social sharing buttons
- Category tags (non-clickable)
- SEO with JSON-LD schema
- Image optimization

**Content:**
- Fetches from Google Sheets by slug
- Falls back to static articles
- Displays HTML content directly

#### 4. Opportunities (`/opportunities`)
**Features:**
- Opportunity listings
- Advanced filters:
  - Category
  - Region
  - Country
  - Tags
  - Featured only
- Sorting (Deadline, Newest, Amount)
- Search functionality
- Opportunity cards with images

**Data Sources:**
- Google Sheets opportunities
- Static opportunities (fallback)

#### 5. Opportunity Detail (`/opportunities/:id`)
**Features:**
- Full opportunity details
- Application link
- Deadline countdown
- Related opportunities
- SEO optimized

#### 6. Procurement & Tenders (`/procurement-tenders`)
**Features:**
- Tender listings
- Category filters
- Search functionality
- Pagination
- Tender cards

#### 7. Markets (`/markets`)
**Features:**
- Live market data
- FX rates
- Crypto prices
- Macro indicators
- Watchlist functionality
- Sparkline charts
- Search markets

**Data Sources:**
- Alpha Vantage (FX)
- CoinGecko (Crypto)
- FRED (Macro indicators)

#### 8. Market Detail (`/markets/:symbol`)
**Features:**
- Detailed market view
- Full chart
- Historical data
- Add to watchlist
- Market information

#### 9. Community (`/community`)
**Features:**
- Membership form
- Newsletter signup
- Community groups
- Social links

#### 10. About (`/about`)
**Features:**
- Company information
- Services cards
- Mission and values
- Team information

#### 11. Contact (`/contact`)
**Features:**
- Contact form (sends to info@bizgrowthafrica.com)
- FAQ section
- Response time information
- Direct anchor link: `/contact#contact-form`

### Website Components

#### Navigation
- **Navbar:**
  - Logo
  - Navigation links
  - Dark mode toggle
  - Mobile menu
  - Smooth animations

#### Footer
- **Sections:**
  - Quick links
  - Newsletter signup (First Name, Last Name, Email)
  - Social media icons (with brand colors)
  - Copyright information

#### SEO Features
- **Per-page SEO:**
  - Dynamic titles
  - Meta descriptions
  - Open Graph tags
  - Twitter cards
  - JSON-LD schema
  - Canonical URLs

#### Performance Features
- **Image Optimization:**
  - Lazy loading
  - Eager loading for above-fold images
  - Preload for hero images
  - Progressive fallbacks
- **Route Progress Bar:** Shows progress on navigation
- **Scroll to Top:** Auto-scrolls on route change
- **Preloader:** Loading animation on initial load

#### Dark Mode
- System preference detection
- Manual toggle
- Persistent preference (localStorage)
- Smooth transitions

### Google Analytics 4

**Measurement ID:** `G-JEYX2LNTQY`

**Features:**
- Automatic page view tracking
- SPA route change tracking
- Custom event tracking utility
- Development mode debugging

**Implementation:**
- Script in `index.html`
- Tracking hook in `Layout.jsx`
- Utility functions in `utils/analytics.js`

---

## Admin Subdomain Setup

### Overview

The admin panel is deployed on a separate subdomain (`admin.bizgrowthafrica.com`) for:
- Clean separation from main website
- Independent password protection
- Better security isolation
- Professional deployment structure

### Step 1: Create Subdomain in cPanel

1. Log into cPanel
2. Go to **"Subdomains"** (or "Subdomain Manager")
3. Create subdomain: `admin`
4. Set Document Root to: `public_html/admin` (or separate folder)
5. Click **"Create"**

**Important:** Document Root should NOT be `public_html` (main site folder)

### Step 2: Build Admin Panel

```bash
npm run build:admin
```

This creates `dist-admin/` folder with admin-only build.

**Verify Build:**
- Check `dist-admin/index.html` exists (NOT `index.admin.html`)
- Build process automatically renames `index.admin.html` → `index.html`

### Step 3: Upload Files to Subdomain

1. In cPanel File Manager, navigate to subdomain folder (e.g., `public_html/admin`)
2. **Delete all existing files** (if any)
3. Upload **ALL contents** from `dist-admin/` folder:
   - `index.html`
   - `assets/` folder (and all contents)
   - Any other files from `dist-admin/`
4. Upload `.htaccess` file (for SPA routing)

**Important:** Upload the CONTENTS of `dist-admin/`, not the folder itself.

### Step 4: Configure .htaccess

The `.htaccess` file should contain:

```apache
# Enable Rewrite Engine
RewriteEngine On

# Handle React Router - redirect all requests to index.html
# But exclude actual files and directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/uploads/
RewriteRule . /index.html [L]

# Security Headers (optional)
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Content-Type-Options "nosniff"
</IfModule>
```

### Step 5: Set Up Authentication

**Option A: Client-Side Only (Recommended)**
- No additional setup needed (authentication is built-in)
- Remove HTTP Basic Auth from cPanel if enabled

**Option B: HTTP Basic Auth + Client-Side (Double Protection)**
1. In cPanel, go to **"Password Protect Directories"**
2. Navigate to subdomain folder
3. Click **"Protect"**
4. Create username and password
5. Save

**Note:** If using Option B, users will see two password prompts.

### Step 6: Verify Deployment

1. Visit: `https://admin.bizgrowthafrica.com`
2. Should see login page (if client-side auth enabled)
3. After login, should see admin dashboard
4. Test creating/editing content

### Troubleshooting

**Subdomain Shows Main Website:**
- Check Document Root in cPanel Subdomains
- Should be `public_html/admin` (not `public_html`)
- Verify correct files uploaded to subdomain folder

**404 Errors:**
- Make sure `.htaccess` is uploaded
- Check file permissions (644 for files, 755 for folders)
- Verify `index.html` exists in subdomain root

**Blank Page:**
- Check browser console for errors
- Verify all files uploaded correctly
- Check Network tab for failed requests
- Ensure build was successful

**Password Protection Not Working:**
- Verify correct folder is protected
- Clear browser cache
- Try incognito window
- Check `.htaccess` doesn't conflict with password protection

---

## Post Scheduling Setup

### Overview

The scheduling feature allows you to schedule articles, opportunities, and tenders to be published at a specific date and time (GMT+1).

### How It Works

1. **Creating Scheduled Posts:**
   - Check "Schedule this post for later" when creating/editing
   - Select date and time (GMT+1)
   - Post is saved with `status: 'scheduled'` and `scheduledAt` timestamp

2. **Storage:**
   - Posts saved to Google Sheets with:
     - `status: 'scheduled'` (or `'published'` if not scheduled)
     - `scheduledAt: ISO_TIMESTAMP` (stored as UTC)

3. **Filtering:**
   - Data fetching hooks automatically filter out:
     - Draft posts (`status: 'draft'`)
     - Scheduled posts where `scheduledAt` hasn't passed yet (GMT+1)

4. **Publishing:**
   - `publish-scheduled.php` endpoint checks all sheets
   - Updates scheduled posts to `published` when time arrives
   - Sets `publishedAt` to current datetime (GMT+1)

### Google Sheets Columns

Add these columns to your Google Sheets (if not already present):

**Articles, Opportunities, Tenders Sheets:**
- `status` (text) - Values: `published`, `scheduled`, `draft`
- `scheduledAt` (text) - ISO timestamp (e.g., `2026-01-27T14:30:00.000Z`)
- `publishedAt` (text) - ISO timestamp with timezone (e.g., `2026-01-27T14:30:00+01:00`)

**Note:** If these columns don't exist, they will be created automatically when you save a scheduled post.

### Publishing Scheduled Posts

#### Option 1: Manual Publishing (Admin Dashboard)

1. Go to admin dashboard
2. Click **"Publish Scheduled"** button
3. System checks all sheets and publishes posts whose time has arrived
4. Status updates from `scheduled` to `published`

#### Option 2: Automatic Publishing (Cron Job - Recommended)

**For cPanel:**

1. Go to **cPanel → Cron Jobs**
2. Add a new cron job:
   - **Minute:** `*/5` (every 5 minutes) or `*/15` (every 15 minutes)
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   - **Command:**
     ```bash
     curl -X POST https://www.bizgrowthafrica.com/api/publish-scheduled.php
     ```
     Or using PHP:
     ```bash
     /usr/bin/php /home/username/public_html/api/publish-scheduled.php
     ```

**For Other Hosting:**

Use external cron services:
- **EasyCron** (https://www.easycron.com/)
- **Cron-job.org** (https://cron-job.org/)

Set URL to: `https://www.bizgrowthafrica.com/api/publish-scheduled.php` with POST method.

### PHP Endpoint Configuration

The `api/publish-scheduled.php` endpoint requires these environment variables:

1. **GOOGLE_APPS_SCRIPT_URL** - Your Google Apps Script web app URL
2. **GOOGLE_SHEETS_ID** - Your Google Sheets spreadsheet ID
3. **GOOGLE_SHEETS_API_KEY** - Your Google Sheets API key

#### Setting Environment Variables

**Option A: .env File (Local Development)**

Add to `.env`:
```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SHEETS_API_KEY=your_api_key
```

**Option B: cPanel Environment Variables**

1. Go to **cPanel → Environment Variables**
2. Add each variable:
   - `GOOGLE_APPS_SCRIPT_URL`
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SHEETS_API_KEY`

**Option C: .htaccess (Not Recommended for Production)**

Add to `.htaccess`:
```apache
SetEnv GOOGLE_APPS_SCRIPT_URL "https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec"
SetEnv GOOGLE_SHEETS_ID "your_spreadsheet_id"
SetEnv GOOGLE_SHEETS_API_KEY "your_api_key"
```

### Timezone Handling

- **Input:** Users select date/time in GMT+1 (West Africa Time)
- **Storage:** Times are converted to UTC and stored as ISO strings
- **Comparison:** When checking if a post should be published, times are compared in GMT+1
- **Display:** Scheduled times are shown to users in GMT+1 format

### Testing Scheduled Posts

1. **Create a scheduled post:**
   - Go to admin panel → Create Article/Opportunity/Tender
   - Check "Schedule this post for later"
   - Set a time 1-2 minutes in the future
   - Save

2. **Verify it's scheduled:**
   - Check Google Sheets - `status` should be `scheduled`
   - Check the main website - the post should NOT appear yet
   - Check admin list pages - should show "Scheduled" badge

3. **Publish manually:**
   - Wait until the scheduled time passes
   - Go to admin dashboard
   - Click "Publish Scheduled"
   - The post should now appear on the website
   - Status should update to "Published" in admin list pages

4. **Verify automatic publishing:**
   - Set up a cron job (every 5 minutes)
   - Create a scheduled post for a few minutes in the future
   - Wait and check - it should be published automatically

### Troubleshooting Scheduled Posts

**Scheduled posts not publishing:**
1. Check cron job is running and calling the endpoint
2. Check environment variables are set correctly
3. Check Google Sheets has `status` and `scheduledAt` columns
4. Check timezone conversion is working (GMT+1)
5. Check PHP endpoint logs for errors

**Posts appearing before scheduled time:**
- Client-side filtering should prevent this
- Check `scheduledAt` timestamp is correct
- Check timezone conversion is working properly
- Verify hook's filtering logic is correct

**Posts not appearing after scheduled time:**
- Check if post status was updated to `published`
- Manually click "Publish Scheduled" in admin dashboard
- Verify cron job is running (if using automatic publishing)
- Check admin list pages auto-refresh (every 30 seconds)

**Status not updating in admin list:**
- Auto-refresh runs every 30 seconds
- Click "Refresh" button for immediate update
- Check Google Sheets directly to verify status change
- Verify admin hooks are reading status correctly

---

## Deployment Guide

### cPanel Deployment (Syskay)

#### Main Website Deployment

#### Step 1: Build Main Website
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

#### Step 2: Upload Main Website Files
1. Log into cPanel
2. Open **File Manager**
3. Navigate to `public_html`
4. Upload all contents of `dist/` folder to `public_html/`
   - Maintain folder structure
   - Overwrite existing files if updating
5. Upload `.htaccess` file to `public_html/`

#### Step 3: Upload API Files
1. In File Manager, navigate to `public_html/`
2. Create `api` folder if it doesn't exist
3. Upload these files:
   - `api/google-sheets-proxy.php`
   - `api/google-sheets-read.php`
   - `api/contact.php`
   - `api/upload-image.php`
   - `api/_lib/response.php` (maintain folder structure)
   - `api/market/` folder with all PHP files

**File Structure Should Be:**
```
public_html/
├── index.html
├── assets/ (Vite build output)
├── api/
│   ├── google-sheets-proxy.php
│   ├── google-sheets-read.php
│   ├── contact.php
│   ├── upload-image.php
│   ├── _lib/
│   │   └── response.php
│   └── market/
│       ├── snapshot.php
│       ├── history.php
│       └── search.php
└── ...
```

#### Step 4: Set Permissions
1. Set `api/_cache/` folder permissions to **755** or **775** (writable)
2. Ensure PHP files have **644** permissions

#### Step 5: Configure Environment Variables
Update the hardcoded values in PHP files if needed:
- `api/google-sheets-read.php` - API key and Spreadsheet ID
- Or use cPanel environment variables

#### Step 3: Build Admin Panel
```bash
npm run build:admin
```

This creates `dist-admin/` folder with admin-only build.

#### Step 4: Upload Admin Panel to Subdomain
1. In cPanel File Manager, navigate to subdomain folder (e.g., `public_html/admin`)
2. **Delete all existing files** (if any)
3. Upload **ALL contents** from `dist-admin/` folder:
   - `index.html`
   - `assets/` folder (and all contents)
   - Any other files from `dist-admin/`
4. Upload `.htaccess` file (for SPA routing)

**Important:** Upload the CONTENTS of `dist-admin/`, not the folder itself.

#### Step 5: Set Up Admin Authentication
See "Admin Authentication" section in Admin Panel Guide above.

#### Step 6: Upload API Files
1. In File Manager, navigate to `public_html/`
2. Create `api` folder if it doesn't exist
3. Upload these files:
   - `api/google-sheets-proxy.php`
   - `api/google-sheets-read.php`
   - `api/contact.php`
   - `api/upload-image.php`
   - `api/publish-scheduled.php`
   - `api/_lib/response.php` (maintain folder structure)
   - `api/market/` folder with all PHP files

**File Structure Should Be:**
```
public_html/
├── index.html
├── assets/ (Vite build output)
├── api/
│   ├── google-sheets-proxy.php
│   ├── google-sheets-read.php
│   ├── contact.php
│   ├── upload-image.php
│   ├── publish-scheduled.php
│   ├── _lib/
│   │   └── response.php
│   └── market/
│       ├── snapshot.php
│       ├── history.php
│       └── search.php
└── uploads/ (created automatically)
    ├── articles/
    ├── opportunities/
    └── tenders/
```

#### Step 7: Set Permissions
1. Set `api/_cache/` folder permissions to **755** or **775** (writable)
2. Set `uploads/` folder permissions to **755** (writable)
3. Ensure PHP files have **644** permissions

#### Step 8: Configure Environment Variables
Update the hardcoded values in PHP files if needed:
- `api/google-sheets-read.php` - API key and Spreadsheet ID
- Or use cPanel environment variables (recommended)

#### Step 9: Test Deployment
1. Visit your website: `https://www.bizgrowthafrica.com`
2. Test admin panel: `https://admin.bizgrowthafrica.com`
3. Test API endpoints
4. Verify Google Sheets integration
5. Test image uploads
6. Test scheduled post publishing

### Netlify Deployment

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variables: Add all `VITE_*` variables in Netlify dashboard
5. Deploy

### Vercel Deployment

1. Connect repository to Vercel
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: Add all `VITE_*` variables
6. Deploy

**Note:** For Netlify/Vercel, you'll need to host PHP API separately or use serverless functions.

---

## Troubleshooting

### Google Sheets API Issues

#### Error: 403 Forbidden
**Solution:**
1. Make sure spreadsheet is set to "Anyone with the link" → "Viewer"
2. Enable Google Sheets API in Google Cloud Console
3. Wait 30-60 seconds for changes to propagate
4. Clear browser cache

#### Error: "Sheet not found"
**Solution:**
- Verify sheet names match exactly: "Articles", "Opportunities", "Tenders"
- Check for extra spaces in sheet names
- Ensure sheets exist in the spreadsheet

#### Error: "Failed to save"
**Solution:**
- Check Apps Script is deployed correctly
- Verify Web app URL in `.env`
- Check Apps Script execution logs
- Ensure "Anyone" access is set

### Image Upload Issues

#### Error: "File too large"
**Solution:**
- Maximum file size: 5MB
- Compress images before uploading
- Use external URLs for large images

#### Error: "Invalid file type"
**Solution:**
- Supported formats: JPG, PNG, WebP
- Convert images to supported format

### Build Issues

#### Error: "Module not found"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Error: "Build failed"
**Solution:**
- Check for syntax errors
- Verify all imports are correct
- Check console for specific errors

### Admin Panel Issues

#### Blank Pages
**Solution:**
- Check browser console for errors
- Verify Google Sheets API is working
- Check network tab for failed requests
- Ensure environment variables are set

#### Rich Text Editor Not Loading
**Solution:**
- Clear browser cache
- Check Tiptap dependencies are installed
- Verify no JavaScript errors in console

### Contact Form Issues

#### Emails Not Sending
**Solution:**
- Verify PHP mail is configured on server
- Check spam folder
- Test PHP endpoint directly
- Check server error logs

### Admin Subdomain Issues

#### Subdomain Shows Main Website
**Solution:**
- Check Document Root in cPanel Subdomains
- Should be `public_html/admin` (not `public_html`)
- Verify correct files uploaded to subdomain folder
- Check subdomain DNS configuration

#### Admin Panel Shows Blank Page
**Solution:**
- Check browser console for errors
- Verify all files uploaded correctly (especially `index.html`)
- Check Network tab for failed requests
- Ensure build was successful (`npm run build:admin`)
- Verify `.htaccess` is uploaded and correct
- Try hard refresh (Ctrl+F5) or incognito window

#### Admin Routes Not Working (404)
**Solution:**
- Make sure `.htaccess` is uploaded to subdomain folder
- Check file permissions (644 for files, 755 for folders)
- Verify Apache mod_rewrite is enabled
- Check `.htaccess` syntax is correct
- Ensure `index.html` exists in subdomain root

#### Password Protection Not Working
**Solution:**
- Verify correct folder is protected in cPanel
- Clear browser cache
- Try incognito/private window
- Check `.htaccess` doesn't conflict with password protection
- Verify HTTP Basic Auth is enabled (if using Option B)

### Scheduled Posts Issues

#### Scheduled Posts Not Publishing
**Solution:**
1. Check cron job is running and calling the endpoint
2. Check environment variables are set correctly
3. Check Google Sheets has `status` and `scheduledAt` columns
4. Check timezone conversion is working (GMT+1)
5. Check PHP endpoint logs for errors
6. Manually click "Publish Scheduled" in admin dashboard

#### Posts Appearing Before Scheduled Time
**Solution:**
- Client-side filtering should prevent this
- Check `scheduledAt` timestamp is correct in Google Sheets
- Check timezone conversion is working properly
- Verify hook's filtering logic is correct
- Check if post status is actually `scheduled`

#### Posts Not Appearing After Scheduled Time
**Solution:**
- Check if post status was updated to `published` in Google Sheets
- Manually click "Publish Scheduled" in admin dashboard
- Verify cron job is running (if using automatic publishing)
- Check admin list pages auto-refresh (every 30 seconds)
- Click "Refresh" button for immediate update

#### Status Not Updating in Admin List
**Solution:**
- Auto-refresh runs every 30 seconds (wait for it)
- Click "Refresh" button for immediate update
- Check Google Sheets directly to verify status change
- Verify admin hooks are reading status correctly
- Check browser console for errors

### Hero Image Issues

#### Hero Image Not Displaying
**Solution:**
- Check image URL is absolute (starts with `http://` or `https://`)
- Verify image was uploaded successfully (check `uploads/` folder)
- Check file permissions on uploaded image (should be 644)
- Verify `.htaccess` excludes `/uploads/` from SPA routing
- Check browser console for CORS or loading errors
- Verify `heroImage` field exists in Google Sheets

#### Hero Image Preview Not Working
**Solution:**
- Check browser console for errors
- Verify image upload completed successfully
- Check image URL is correct
- May be CORS issue in development (should work in production)
- Try refreshing the page

### Draft Management Issues

#### Drafts Not Saving
**Solution:**
- Check browser `localStorage` is enabled
- Check browser console for errors
- Verify `draftStorage.js` utility is working
- Check if browser storage quota is exceeded

#### Drafts Not Appearing in List
**Solution:**
- Check drafts are saved to `localStorage`
- Verify admin list pages are loading drafts
- Check browser console for errors
- Try refreshing the page

#### Editing Draft Creates New Entry
**Solution:**
- This should not happen - drafts update existing entries
- Check `draftId` is being passed correctly
- Verify `saveDraft` function is updating, not creating
- Check browser console for errors

---

## Maintenance & Updates

### Regular Maintenance Tasks

1. **Content Updates:**
   - Regularly add new articles
   - Update opportunities and tenders
   - Remove expired content

2. **Google Sheets Cleanup:**
   - Archive old articles
   - Remove duplicate entries
   - Verify data integrity

3. **Performance Monitoring:**
   - Check Google Analytics
   - Monitor page load times
   - Review error logs

4. **Security Updates:**
   - Keep dependencies updated
   - Review API key security
   - Monitor for vulnerabilities

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Adding New Features

1. **New Page:**
   - Create component in `src/pages/`
   - Add route in `src/App.jsx`
   - Add navigation link if needed

2. **New Component:**
   - Create in `src/components/`
   - Import and use where needed

3. **New Hook:**
   - Create in `src/hooks/`
   - Export and use in components

### Backup Strategy

1. **Google Sheets:**
   - Regular exports to Excel/CSV
   - Version history in Google Sheets
   - Manual backups before major changes

2. **Code:**
   - Use Git for version control
   - Regular commits
   - Tag releases

3. **Images:**
   - Backup `public/uploads/` folder
   - Keep external image URLs documented

---

## Additional Resources

### Documentation Files
- **`BizGrowth_Africa_Complete_Documentation.md`** - This comprehensive documentation file replaces all previous setup guides
- **`README.md`** - Quick project overview and getting started
- **`GOOGLE_APPS_SCRIPT_CODE.js`** - Google Apps Script code for Google Sheets operations
- Keep this document updated with any changes

### Support
- Website: https://bizgrowthafrica.com
- Contact: https://bizgrowthafrica.com/contact
- Email: info@bizgrowthafrica.com

### Useful Links
- Google Sheets: https://sheets.google.com
- Google Cloud Console: https://console.cloud.google.com
- Google Apps Script: https://script.google.com
- Ninth Grid (Images): https://www.ninthgrid.com

---

## Appendix

### Environment Variables Reference

```env
# Google Sheets
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id
VITE_GOOGLE_APPS_SCRIPT_URL=your_script_url

# API
VITE_API_BASE_URL=https://www.bizgrowthafrica.com
```

### Google Sheets Column Reference

**Articles:**
title, slug, category, subheading, summary, content, image, heroImage, publishedAt, author, createdAt, status, scheduledAt

**Opportunities:**
title, org, country, region, category, amountMin, amountMax, currency, deadline, postedAt, link, tags, featured, description, heroImage, createdAt, status, scheduledAt

**Tenders:**
title, agency, category, country, region, deadline, postedAt, link, description, eligibility, value, heroImage, createdAt, status, scheduledAt

**Note:** `status`, `scheduledAt`, and `heroImage` columns are created automatically when needed.

### API Endpoints

**Frontend Calls:**
- `/api/google-sheets-read.php?sheet=Articles&range=A1:Z1000`
- `/api/google-sheets-proxy.php` (POST)
- `/api/contact.php` (POST)
- `/api/upload-image.php` (POST)
- `/api/market/snapshot.php?ids=USDZAR,USDNGN`
- `/api/market/history.php?id=USDZAR&range=1D`
- `/api/market/search.php?q=zar`

---

---

## Additional Features & Functionalities

### Hero Images

**Purpose:** Hero images are banner images displayed in the hero section of article/opportunity/tender pages, separate from content images.

**Upload:**
- Available in admin forms (Articles, Opportunities, Tenders)
- Upload via "Hero Image (Banner)" section
- Supports server-side upload or external URL
- Images saved to `public_html/uploads/[type]/`
- Returns absolute URL for proper display

**Display:**
- Hero images appear in hero section/banner on main website
- Prioritized over regular images in article cards and previews
- Fallback to regular images if hero image not available
- Cross-origin support for external images

### Draft Storage System

**How It Works:**
- Drafts are stored in browser `localStorage` (client-side only)
- Drafts do NOT save to Google Sheets until published
- Drafts do NOT appear on main website
- Drafts persist across browser sessions until published or deleted

**Draft Management:**
- Save drafts using "Save as Draft" button
- View drafts in admin list pages (marked with "Draft" badge)
- Edit drafts by clicking "Edit" on draft items
- Editing a draft updates the existing draft (does not create new entry)
- Publish or schedule drafts at any time

**Storage Format:**
- Key: `drafts_[type]_[id]`
- Types: `articles`, `opportunities`, `tenders`
- Auto-refreshes every 5 seconds to catch updates

### Auto-Refresh System

**Admin List Pages:**
- Auto-refresh Google Sheets data every 30 seconds
- Catches status updates (scheduled → published)
- Manual refresh button available for immediate update
- Drafts refresh every 5 seconds

**Purpose:**
- Ensures admin sees latest status changes
- Catches scheduled posts that have been published
- Keeps data synchronized without manual refresh

### Image Optimization

**Loading Strategies:**
- **Eager Loading:** Above-fold images, hero images
- **Lazy Loading:** Below-fold images, article cards
- **Preload:** Hero images for faster display
- **Progressive Fallbacks:** Multiple image candidates with fallback chain

**Image Candidates:**
- Articles/opportunities can have multiple image candidates
- System tries each candidate until one loads successfully
- Fallback to placeholder if all candidates fail
- Hero images prioritized over regular images

### Status Filtering

**Public Website:**
- Only shows posts with `status: 'published'`
- Filters out `status: 'draft'`
- Filters out `status: 'scheduled'` where time hasn't passed
- If `status` is empty, post is hidden

**Admin Panel:**
- Shows all posts (published, scheduled, draft)
- Status badges indicate current status
- Filter by status (All, Published, Draft, Scheduled)
- Auto-updates when status changes

### Timezone Handling

**All times use GMT+1 (West Africa Time / Africa/Lagos):**
- User input: GMT+1
- Storage: UTC (converted from GMT+1)
- Display: GMT+1
- Comparison: GMT+1

**Time Utilities:**
- `getTimeAgo()` - Calculates "time ago" from GMT+1 perspective
- `toGMTPlus1ISO()` - Converts GMT+1 datetime to UTC ISO string
- `getMinScheduleDateTime()` - Gets minimum schedulable datetime (GMT+1)

### Google Sheets Auto-Column Creation

**Dynamic Column Addition:**
- Google Apps Script automatically adds missing columns
- New fields (like `status`, `scheduledAt`, `heroImage`) are added automatically
- No manual column creation needed
- Preserves existing data when adding columns

**Supported Operations:**
- Append: Creates columns if missing
- Update: Creates columns if missing
- Maintains exact values (null, undefined, empty string)

---

**End of Documentation**

*This document contains all setup instructions, feature documentation, and troubleshooting guides for the BizGrowth Africa platform. Keep this document updated as the platform evolves.*

**Last Updated:** January 2026  
**Version:** 2.0

---

## File Cleanup Summary

The following setup and guide files have been consolidated into this documentation and deleted:

**Deleted Setup/Guide Files:**
- ✅ `SCHEDULING_SETUP.md` - Content moved to "Post Scheduling Setup" section
- ✅ `ADMIN_PASSWORD_SETUP.md` - Content moved to "Admin Authentication" section
- ✅ `ADMIN_SUBDOMAIN_SETUP.md` - Content moved to "Admin Subdomain Setup" section
- ✅ `ADMIN_ACCESS_SETUP.md` - Content moved to "Admin Subdomain Setup" section
- ✅ `ADMIN_AUTHENTICATION_GUIDE.md` - Content moved to "Admin Authentication" section
- ✅ `ADMIN_LOCALHOST_ACCESS.md` - Content moved to "Initial Setup & Installation" section
- ✅ `ADMIN_SUBDOMAIN_FIX.md` - Content moved to "Admin Subdomain Setup" troubleshooting
- ✅ `SUBDOMAIN_TROUBLESHOOTING.md` - Content moved to "Admin Subdomain Setup" troubleshooting
- ✅ `PASSWORD_PROTECTION_FIX.md` - Content moved to "Admin Authentication" section
- ✅ `INSTALL_PHP_WINDOWS.md` - Content moved to "Initial Setup & Installation" section

**All setup instructions are now in this single comprehensive documentation file.**

---

## Cleanup Summary (January 2026)

### Deleted Setup/Guide Files (Consolidated into Documentation)
- ✅ `SCHEDULING_SETUP.md` → Moved to "Post Scheduling Setup" section
- ✅ `ADMIN_PASSWORD_SETUP.md` → Moved to "Admin Authentication" section
- ✅ `ADMIN_SUBDOMAIN_SETUP.md` → Moved to "Admin Subdomain Setup" section
- ✅ `ADMIN_ACCESS_SETUP.md` → Moved to "Admin Subdomain Setup" section
- ✅ `ADMIN_AUTHENTICATION_GUIDE.md` → Moved to "Admin Authentication" section
- ✅ `ADMIN_LOCALHOST_ACCESS.md` → Moved to "Initial Setup & Installation" section
- ✅ `ADMIN_SUBDOMAIN_FIX.md` → Moved to "Admin Subdomain Setup" troubleshooting
- ✅ `SUBDOMAIN_TROUBLESHOOTING.md` → Moved to "Admin Subdomain Setup" troubleshooting
- ✅ `PASSWORD_PROTECTION_FIX.md` → Moved to "Admin Authentication" section
- ✅ `INSTALL_PHP_WINDOWS.md` → Moved to "Initial Setup & Installation" section

### Deleted Unused Files
- ✅ `.htaccess.admin` - Duplicate of `.htaccess` (not needed)
- ✅ `public/vite.svg` - Unused Vite logo
- ✅ `public/200.html` - Netlify-specific (not used with cPanel)
- ✅ `public/404.html` - Netlify-specific (not used with cPanel)
- ✅ `netlify.toml` - Netlify deployment config (not used with cPanel)
- ✅ `vercel.json` - Vercel deployment config (not used with cPanel)
- ✅ `public/_redirects` - Netlify redirects (not used with cPanel)

### Updated Files
- ✅ `README.md` - Removed references to non-existent components (NewsInlineCard, NewsletterCTA)
- ✅ `README.md` - Updated deployment notes to reference complete documentation
- ✅ `BizGrowth_Africa_Complete_Documentation.md` - Comprehensive update with all setup guides and missing functionalities

### Assets Status
**All assets in use:**
- ✅ `src/assets/img/logos/bizgrowth1.png` - Used in Preloader (dark mode)
- ✅ `src/assets/img/logos/bizgrowth2.png` - Used in Preloader (light mode)
- ✅ `src/assets/img/logos/bizgrowth3.png` - Used in Footer and Navbar
- ✅ `src/assets/placeholder.svg` - Used in NewsCard as fallback

**All public assets in use:**
- ✅ `public/favicon.png`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` - Referenced in `index.html`
- ✅ `public/robots.txt`, `public/sitemap.xml` - SEO files (referenced in README and documentation)
