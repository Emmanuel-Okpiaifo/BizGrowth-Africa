# Subdomain Troubleshooting Guide

## Problem: admin.bizgrowthafrica.com shows main website instead of admin

This usually means the subdomain is pointing to the wrong folder. Here's how to fix it:

## Step 1: Check Where Your Subdomain Points

1. **Log into cPanel**
2. Go to **"Subdomains"** (or "Subdomain Manager")
3. Find `admin` subdomain
4. **Check the "Document Root"** - this shows where it's pointing

**Common locations:**
- `public_html/admin` ✅ (correct - separate folder)
- `public_html` ❌ (wrong - same as main site)
- `public_html/subdomains/admin` ✅ (also correct)

## Step 2: Fix the Document Root (If Wrong)

If your subdomain points to `public_html` (main site folder):

1. **Option A: Change Document Root**
   - In Subdomains, click on `admin` subdomain
   - Change "Document Root" to: `public_html/admin`
   - Save

2. **Option B: Create Separate Folder**
   - In File Manager, create folder: `public_html/admin-panel`
   - In Subdomains, change Document Root to: `public_html/admin-panel`
   - Upload admin files there

## Step 3: Verify Admin Build

Make sure you built the admin version:

```bash
npm run build:admin
```

This should create a `dist-admin` folder.

**Check the build:**
- Open `dist-admin/index.html`
- Look for: `<script type="module" src="/src/mainAdmin.jsx"></script>`
- If it says `main.jsx` instead, the build didn't work correctly

## Step 4: Upload Correct Files

1. **Delete everything** in the subdomain folder (if it has main site files)
2. **Upload ALL contents** from `dist-admin` folder
3. **Upload `.htaccess`** file

**Important:** Upload the CONTENTS of `dist-admin`, not the folder itself.

## Step 5: Verify File Structure

Your subdomain folder should have:
```
public_html/admin/  (or wherever it points)
├── .htaccess
├── index.html          ← Should say "Admin Panel" in title
├── assets/
│   ├── index-[hash].js
│   └── ...
└── favicon.png (and other assets)
```

## Step 6: Check index.html

Open the `index.html` in your subdomain folder. It should:
- Title: "BizGrowth Africa — Admin Panel"
- Script: `src="/src/mainAdmin.jsx"` (NOT `main.jsx`)

If it shows `main.jsx`, you uploaded the wrong build.

## Quick Test

1. Visit: `https://admin.bizgrowthafrica.com`
2. Open browser DevTools (F12)
3. Check Console tab
4. Look for errors

**If you see:**
- "Cannot find module" → Wrong build uploaded
- 404 errors → Files not uploaded correctly
- Main website loads → Subdomain pointing to wrong folder

## Common Issues

### Issue 1: Subdomain Points to Main Site Folder
**Symptom:** Shows main website  
**Fix:** Change Document Root in cPanel Subdomains

### Issue 2: Wrong Build Uploaded
**Symptom:** Shows main website or errors  
**Fix:** 
- Run `npm run build:admin` again
- Upload from `dist-admin` folder (not `dist`)

### Issue 3: Files in Wrong Location
**Symptom:** 404 errors  
**Fix:**
- Make sure files are in the subdomain's Document Root folder
- Check `.htaccess` is uploaded
- Verify `index.html` is in root of subdomain folder

### Issue 4: Cache Issues
**Symptom:** Old version shows  
**Fix:**
- Clear browser cache
- Try incognito/private window
- Hard refresh (Ctrl+F5)

## Verification Checklist

- [ ] Subdomain Document Root is NOT `public_html` (main site)
- [ ] Built with `npm run build:admin`
- [ ] Uploaded from `dist-admin` folder (not `dist`)
- [ ] `index.html` has `mainAdmin.jsx` in script tag
- [ ] `.htaccess` file is uploaded
- [ ] All files uploaded to correct subdomain folder
- [ ] Cleared browser cache

## Still Not Working?

1. **Check cPanel Error Logs:**
   - Go to "Errors" in cPanel
   - Look for recent errors

2. **Verify Subdomain DNS:**
   - Make sure subdomain DNS is set up correctly
   - Should point to same server as main domain

3. **Test with Simple File:**
   - Create `test.html` in subdomain folder
   - Upload it
   - Visit: `https://admin.bizgrowthafrica.com/test.html`
   - If this works, subdomain is configured correctly
   - If not, subdomain DNS/configuration issue

4. **Contact Hosting:**
   - If subdomain won't point to separate folder
   - Ask them to configure it properly

---

## Quick Fix Summary

**Most likely issue:** Subdomain Document Root is pointing to `public_html` (main site)

**Quick fix:**
1. cPanel → Subdomains
2. Change `admin` Document Root to: `public_html/admin`
3. Upload admin files to `public_html/admin/`
4. Test again
