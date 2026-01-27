# Admin Subdomain Fix Guide

## Problem 1: Directory Listing Instead of Admin Panel

You're seeing a directory listing because `index.html` is missing. The build process converts `index.admin.html` → `index.html`.

### Solution:

1. **Rebuild the admin version:**
   ```bash
   npm run build:admin
   ```

2. **Check the `dist-admin` folder:**
   - It should contain `index.html` (NOT `index.admin.html`)
   - The build process renames it automatically

3. **Delete everything** in your admin subdomain folder

4. **Upload ONLY the contents from `dist-admin` folder:**
   - Upload `index.html` (this is the built file)
   - Upload `assets/` folder
   - Upload `.htaccess` file
   - Upload any other files from `dist-admin`

5. **DO NOT upload:**
   - ❌ `index.admin.html` (this is the source file, not the build)
   - ❌ Any files from project root
   - ❌ Source code files

### Verify:

After upload, your admin subdomain folder should have:
```
public_html/admin/  (or wherever subdomain points)
├── .htaccess
├── index.html          ← This is the built file (not index.admin.html)
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── favicon.png (and other assets)
```

## Problem 2: Main Site Still Has Admin Routes

I've removed the admin routes from the main site's `App.jsx`. Now:

- ✅ `bizgrowthafrica.com/admin` → Will show 404 (admin routes removed)
- ✅ `admin.bizgrowthafrica.com` → Will show admin panel (separate build)

### What Changed:

- Removed admin route imports from `src/App.jsx`
- Removed admin routes from main site routing
- Admin is now ONLY accessible via subdomain

### Next Steps:

1. **Rebuild main website:**
   ```bash
   npm run build
   ```

2. **Upload new main site build** to `public_html/`

3. **Rebuild admin:**
   ```bash
   npm run build:admin
   ```

4. **Upload admin build** to admin subdomain folder

## Quick Checklist

### For Admin Subdomain:
- [ ] Run `npm run build:admin`
- [ ] Check `dist-admin` has `index.html` (not `index.admin.html`)
- [ ] Delete old files from subdomain folder
- [ ] Upload ALL contents from `dist-admin` folder
- [ ] Upload `.htaccess` file
- [ ] Test: `https://admin.bizgrowthafrica.com`

### For Main Site:
- [ ] Run `npm run build`
- [ ] Upload new build to `public_html/`
- [ ] Test: `https://bizgrowthafrica.com/admin` should show 404 or redirect

## Why This Happened

1. **Directory Listing:** You uploaded `index.admin.html` (source file) instead of the built `index.html`
2. **Main Site Admin:** The main site's `App.jsx` still had admin routes, so `/admin` worked there too

Both are now fixed!
