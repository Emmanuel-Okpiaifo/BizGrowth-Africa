# Admin Subdomain Setup Guide

## Overview

You've created the subdomain `admin.bizgrowthafrica.com`. This guide shows you exactly what files to upload and how to organize them.

## Option 1: Admin-Only Build (Recommended)

This creates a separate, optimized build that **only includes admin functionality** - smaller, cleaner, and faster.

### Step 1: Build Admin-Only Version

Run this command in your project:

```bash
npm run build:admin
```

This creates a `dist-admin` folder with only admin files.

### Step 2: Upload Files to Subdomain

1. **In cPanel, find your subdomain folder:**
   - Usually located at: `public_html/admin` or `public_html/subdomains/admin`
   - Check where cPanel created it when you set up the subdomain

2. **Upload ALL contents from `dist-admin` folder:**
   - Select all files and folders inside `dist-admin`
   - Upload them to your subdomain folder
   - **Important:** Upload the CONTENTS, not the folder itself

3. **Upload `.htaccess` file:**
   - Copy the `.htaccess` file from project root
   - Upload it to the subdomain folder (same location as `index.html`)

### Step 3: Verify File Structure

Your subdomain folder should look like this:

```
public_html/admin/  (or wherever your subdomain points)
├── .htaccess
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── (other build files)
```

### Step 4: Password Protect

1. In cPanel, go to **"Password Protect Directories"**
2. Navigate to your subdomain folder
3. Click **"Protect"**
4. Create username and password
5. Save

### Step 5: Test

Visit: `https://admin.bizgrowthafrica.com`
- Should prompt for password
- After login, should show admin dashboard
- Root URL (`/`) should redirect to `/admin`

---

## Option 2: Full Build (Simpler, but includes everything)

If you prefer to use the regular build:

### Step 1: Build Regular Version

```bash
npm run build
```

### Step 2: Upload to Subdomain

1. Upload ALL contents from `dist` folder to subdomain folder
2. Upload `.htaccess` file
3. Password protect the folder

**Note:** This includes all website code, but it will work fine. The admin routes will be accessible at `/admin`.

---

## What Files Are Needed?

### Required Files (Both Options):

1. **`index.html`** - Main HTML file
2. **`.htaccess`** - For SPA routing
3. **`assets/` folder** - All JavaScript, CSS, and images
4. **Any other files** in the build folder

### Files You DON'T Need to Upload Separately:

- ❌ `src/` folder (source code - not needed)
- ❌ `node_modules/` (not needed)
- ❌ `package.json` (not needed)
- ❌ Any `.md` files (documentation - not needed)

**Just upload the entire contents of `dist-admin` (or `dist`) folder!**

---

## Quick Reference

### Building:
```bash
# Admin-only build (recommended)
npm run build:admin

# Full build (includes everything)
npm run build
```

### Upload Location:
- Subdomain folder (check cPanel to see where it points)
- Usually: `public_html/admin` or `public_html/subdomains/admin`

### Files to Upload:
- Everything inside `dist-admin/` folder (for admin build)
- Or everything inside `dist/` folder (for full build)
- Plus `.htaccess` file

### After Upload:
1. Password protect the subdomain folder
2. Test at: `https://admin.bizgrowthafrica.com`

---

## Troubleshooting

### Still Getting 404?
- Make sure `.htaccess` is uploaded
- Check file permissions (should be 644 for files, 755 for folders)
- Verify subdomain is pointing to correct folder

### Admin Panel Not Loading?
- Check browser console for errors
- Verify all files uploaded correctly
- Make sure `index.html` is in the root of subdomain folder

### Password Protection Not Working?
- Make sure you're protecting the correct folder
- Clear browser cache
- Try incognito window

---

## Summary

**For Admin Subdomain:**
1. Run: `npm run build:admin`
2. Upload everything from `dist-admin/` to subdomain folder
3. Upload `.htaccess` file
4. Password protect the folder
5. Access at: `https://admin.bizgrowthafrica.com`

That's it! The admin panel will be separate from your main site and password protected.
