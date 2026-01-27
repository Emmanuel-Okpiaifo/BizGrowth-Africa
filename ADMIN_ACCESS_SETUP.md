# Admin Panel Access Setup Guide

## Step 1: Fix 404 Error (SPA Routing)

The 404 error occurs because your server needs to be configured for Single Page Application (SPA) routing.

### Solution: Upload .htaccess File

1. **Build your React app:**
   ```bash
   npm run build
   ```

2. **Upload `.htaccess` file:**
   - The `.htaccess` file has been created in your project root
   - Upload it to your `public_html` folder in cPanel
   - It should be in the same directory as `index.html`

3. **Verify file location:**
   ```
   public_html/
   ├── .htaccess          ← Upload this file here
   ├── index.html
   ├── assets/
   └── ...
   ```

4. **Test:**
   - Visit `https://bizgrowthafrica.com/admin`
   - The 404 error should be gone!

## Step 2: Password Protect Admin Panel

Since your React app is a Single Page Application (SPA), password protecting just the `/admin` route is tricky. Here are your options:

### Option A: Password Protect Entire Site (Simplest)

**Pros:** Very easy, works immediately  
**Cons:** Visitors need password to view the main site

**Steps:**
1. Log into cPanel
2. Find **"Password Protect Directories"** or **"Directory Privacy"**
3. Navigate to `public_html` (your website root)
4. Click on it and select **"Protect"**
5. Enter a directory name (e.g., "BizGrowth Admin")
6. Create a username and password
7. Click **"Save"**

**Note:** This protects the entire website. You might want to use Option B instead.

### Option B: Use Subdomain (Recommended)

**Pros:** Separate access, doesn't affect main site  
**Cons:** Requires subdomain setup

**Steps:**
1. **Create Subdomain in cPanel:**
   - Go to **"Subdomains"** in cPanel
   - Create: `admin.bizgrowthafrica.com`
   - Point it to `public_html/admin` (or create a separate folder)

2. **Upload Admin Build to Subdomain:**
   - Build your React app
   - Upload `dist/` contents to the subdomain folder
   - Upload `.htaccess` file there too

3. **Password Protect Subdomain:**
   - Use **"Password Protect Directories"** on the subdomain folder
   - Set username and password
   - Access admin at: `https://admin.bizgrowthafrica.com`

### Option C: Client-Side Password Check (Quick but Less Secure)

This adds a simple password prompt in the React app itself.

**Pros:** No server configuration needed  
**Cons:** Not truly secure (password in code), can be bypassed

**Implementation:**
- Add a password prompt component
- Check password before showing admin content
- Store password in environment variable

**Note:** This is NOT recommended for production, but works for basic protection.

## Recommended Approach

For your situation, I recommend **Option B (Subdomain)** because:
- ✅ Doesn't affect main website visitors
- ✅ Clean separation
- ✅ Easy to manage
- ✅ Professional approach

## Quick Fix (If You Need It Now)

If you need admin access working immediately:

1. **Upload `.htaccess` file** to fix the 404
2. **Use Option C** (client-side password) as a temporary measure
3. **Set up Option B** (subdomain) when you have time

## Testing

After setting up:

1. **Test SPA Routing:**
   - Visit: `https://bizgrowthafrica.com/admin`
   - Should load without 404

2. **Test Password Protection:**
   - Should prompt for username/password
   - After entering credentials, should see admin panel

## Troubleshooting

### Still Getting 404
- Make sure `.htaccess` is in `public_html` root
- Check file permissions (should be 644)
- Verify Apache mod_rewrite is enabled (contact hosting if needed)

### Password Protection Not Working
- Make sure you're protecting the correct directory
- Clear browser cache
- Try incognito/private window
- Check cPanel error logs

### Admin Panel Not Loading After Password
- Make sure `.htaccess` is also in the protected directory
- Verify all files are uploaded correctly
- Check browser console for errors

---

**Need Help?** Contact your hosting provider (Syskay) if you need assistance with:
- Enabling mod_rewrite
- Setting up subdomains
- Directory password protection
