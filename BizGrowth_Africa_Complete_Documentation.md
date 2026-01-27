# BizGrowth Africa - Complete Documentation & Setup Guide

**Version:** 1.0  
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
8. [Website Features & Functionalities](#website-features--functionalities)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance & Updates](#maintenance--updates)

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

### Step 4: Run Development Server
```bash
# Start Vite dev server
npm run dev

# In another terminal, start PHP server (for API)
npm run dev:php

# Or run both together
npm run dev:all
```

The website will be available at `http://localhost:5173`

### Step 5: Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

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

1. Navigate to: `https://yourdomain.com/admin`
2. The admin panel has a separate layout from the main website

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

1. Navigate to `/admin/articles/new`
2. Fill in the form:
   - **Title** (required) - Auto-generates slug
   - **Slug** - Can be edited manually
   - **Category** (required) - Select from dropdown
   - **Image URL** - External image URL
   - **Subheading** - Brief subheading
   - **Summary** - Article summary
   - **Content** (required) - Use rich text editor
   - **Published Date** - Select date
3. Click **"Save Article"**
4. Article appears in Google Sheets and on website immediately

### Editing Articles

1. Go to `/admin/articles` (Articles List)
2. Find the article you want to edit
3. Click **"Edit"** button
4. Modify any fields
5. Click **"Update Article"**
6. Changes are saved to Google Sheets

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

1. In the rich text editor, click the image icon
2. Choose:
   - **Upload Image:** Select file from computer
     - Supported: JPG, PNG, WebP
     - Max size: 5MB
     - Images saved to `public/uploads/[type]/`
   - **Image URL:** Paste external image URL
     - Validates URL before inserting
3. Image appears in editor immediately

### Creating Opportunities

1. Navigate to `/admin/opportunities`
2. Fill in the form:
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

1. Navigate to `/admin/tenders`
2. Fill in the form:
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

### Admin Panel Features

- **Dark Mode Toggle:** Available in navbar
- **Mobile Responsive:** Works on all screen sizes
- **Real-time Data:** Fetches latest data from Google Sheets
- **Error Handling:** Graceful error messages
- **Loading States:** Shows loading indicators during data fetch

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

## Deployment Guide

### cPanel Deployment (Syskay)

#### Step 1: Build the Application
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

#### Step 2: Upload Frontend Files
1. Log into cPanel
2. Open **File Manager**
3. Navigate to `public_html`
4. Upload all contents of `dist/` folder to `public_html/`
   - Maintain folder structure
   - Overwrite existing files if updating

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

#### Step 6: Test Deployment
1. Visit your website: `https://www.bizgrowthafrica.com`
2. Test admin panel: `https://www.bizgrowthafrica.com/admin`
3. Test API endpoints
4. Verify Google Sheets integration

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
- This file replaces all previous setup guides
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
title, slug, category, subheading, summary, content, image, publishedAt, author, createdAt

**Opportunities:**
title, org, country, region, category, amountMin, amountMax, currency, deadline, postedAt, link, tags, featured, description, createdAt

**Tenders:**
title, agency, category, country, region, deadline, postedAt, link, description, eligibility, value, createdAt

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

**End of Documentation**

*This document contains all setup instructions, feature documentation, and troubleshooting guides for the BizGrowth Africa platform. Keep this document updated as the platform evolves.*
