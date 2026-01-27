# Admin Authentication Guide

## Overview

The admin panel has **two authentication options**:

1. **HTTP Basic Auth** (cPanel password protection) - Server-side
2. **Client-Side Login** (Custom React component) - Client-side

## Current Setup: Client-Side Login

The admin panel now uses a **custom login system** that:
- ✅ Prompts for password on **every new tab**
- ✅ Clears authentication when **tab is closed**
- ✅ Uses `sessionStorage` (not `localStorage`)
- ✅ Single, clean login experience

## Recommendation: Use Only Client-Side Login

### Why?

1. **Better UX**: Single password prompt instead of two
2. **Per-tab behavior**: Password clears when tab closes (exactly what you wanted)
3. **Simpler setup**: No need to manage HTTP Basic Auth

### Setup Steps

1. **Remove HTTP Basic Auth** (if currently enabled):
   - Go to cPanel → "Password Protect Directories"
   - Navigate to your admin subdomain folder
   - Click **"Unprotect"** or remove the protection

2. **Set your password** in `.env`:
   ```env
   VITE_ADMIN_PASSWORD=your_secure_password_here
   ```

3. **Rebuild admin panel:**
   ```bash
   npm run build:admin
   ```

4. **Upload new build** to subdomain

5. **Keep `.htaccess` with SPA routing only** (no Auth directives needed)

### How It Works

- User visits `admin.bizgrowthafrica.com`
- Sees custom login page
- Enters password
- Access granted (stored in `sessionStorage`)
- **Tab closes** → `sessionStorage` clears automatically
- **New tab opens** → Must login again ✅

## Alternative: Use Both (Double Protection)

If you want **maximum security**, you can use both:

### Setup

1. **Keep HTTP Basic Auth enabled** in cPanel
2. **Also use client-side login** (already implemented)
3. Users will see:
   - First: HTTP Basic Auth prompt (browser)
   - Second: Custom login page (React app)

### Pros & Cons

**Pros:**
- ✅ Two layers of protection
- ✅ Server-side + client-side security

**Cons:**
- ⚠️ Users must enter password **twice**
- ⚠️ HTTP Basic Auth doesn't clear on tab close (browser caches it)
- ⚠️ Less user-friendly

## Security Comparison

### Client-Side Only
- **Security Level**: Medium
- **Protection**: Prevents casual access
- **Limitation**: Password visible in compiled JavaScript (can be extracted)
- **Best For**: Most use cases, better UX

### Both (HTTP Basic Auth + Client-Side)
- **Security Level**: High
- **Protection**: Two layers
- **Limitation**: Double password entry
- **Best For**: Maximum security requirements

## Changing the Password

1. **Edit `.env` file:**
   ```env
   VITE_ADMIN_PASSWORD=new_password_here
   ```

2. **Rebuild:**
   ```bash
   npm run build:admin
   ```

3. **Upload new build**

## Troubleshooting

### Still Seeing HTTP Basic Auth Prompt?

- You need to **remove it from cPanel**
- Go to "Password Protect Directories" → Unprotect the folder

### Password Not Working?

- Check `.env` file has `VITE_ADMIN_PASSWORD` set
- Rebuild after changing `.env`
- Clear browser cache

### Want to Disable Client-Side Login?

Remove the `AdminAuthGuard` wrapper from `src/AppAdmin.jsx`:

```jsx
// Before:
<AdminAuthGuard>
  <Routes>...</Routes>
</AdminAuthGuard>

// After:
<Routes>...</Routes>
```

## Summary

**For your use case** (password on every new tab), use **Option A: Client-Side Only**.

1. Remove HTTP Basic Auth from cPanel
2. Set password in `.env`
3. Rebuild and upload
4. Done! ✅

You'll get exactly what you want: password prompt on every new tab, clears when tab closes.
