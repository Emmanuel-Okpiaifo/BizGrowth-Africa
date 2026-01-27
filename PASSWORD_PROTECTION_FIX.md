# Password Protection Fix - Step by Step

## ⚠️ Important: Client-Side Authentication Now Available

The admin panel now has a **custom login system** that prompts for password on every new tab. You have two options:

### Option A: Use Only Client-Side Login (Recommended)

**Pros:**
- ✅ Single password prompt (better UX)
- ✅ Password clears when tab closes
- ✅ Works on every new tab automatically

**Steps:**
1. **Remove HTTP Basic Auth** from cPanel:
   - Go to "Password Protect Directories"
   - Navigate to admin subdomain folder
   - Click "Unprotect" or remove protection
   
2. **Keep only the `.htaccess` with SPA routing** (no Auth directives)

3. **Set password in `.env` file:**
   ```env
   VITE_ADMIN_PASSWORD=your_secure_password
   ```

4. **Rebuild and upload:**
   ```bash
   npm run build:admin
   ```

### Option B: Use Both (Double Password)

**Pros:**
- ✅ More secure (two layers)
- ✅ Server-side protection

**Cons:**
- ⚠️ Users must enter password twice
- ⚠️ HTTP Basic Auth doesn't clear on tab close

**Steps:**
- Keep HTTP Basic Auth enabled in cPanel
- Also use the client-side login
- Users will see two password prompts

---

## The Problem (Original Issue)

When you upload a custom `.htaccess` file, it can override the password protection directives that cPanel adds automatically. You need to **combine both** - password protection AND SPA routing.

## Solution: Proper Setup Order

### Step 1: Remove Current .htaccess (Temporarily)

1. Go to **File Manager** in cPanel
2. Navigate to your admin subdomain folder
3. **Rename** `.htaccess` to `.htaccess.backup` (or delete it temporarily)

### Step 2: Set Up Password Protection in cPanel

1. In cPanel, go to **"Password Protect Directories"** (or **"Directory Privacy"**)
2. Navigate to your **admin subdomain folder**
3. Click **"Protect"**
4. Enter directory name: **"Admin Panel"**
5. **Create username and password**
6. Click **"Save"**

**Important:** cPanel will now create/update `.htaccess` with password protection directives.

### Step 3: Edit .htaccess to Add SPA Routing

After Step 2, cPanel created an `.htaccess` file with password protection. Now you need to **add** the SPA routing rules to it.

1. **Download the `.htaccess` file** from your subdomain folder
2. **Open it in a text editor** - you'll see something like:

```apache
AuthType Basic
AuthName "Admin Panel"
AuthUserFile /home/username/.htpasswds/public_html/admin/passwd
Require valid-user
```

3. **Add the SPA routing rules at the TOP** (before the Auth directives):

```apache
# Enable Rewrite Engine
RewriteEngine On

# Handle React Router - redirect all requests to index.html
# But exclude actual files and directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Password Protection (added by cPanel)
AuthType Basic
AuthName "Admin Panel"
AuthUserFile /home/username/.htpasswds/public_html/admin/passwd
Require valid-user
```

4. **Save the file** and **upload it back** to your subdomain folder

### Step 4: Verify File Permissions

Make sure:
- `.htaccess` has **644** permissions
- Folder has **755** permissions

### Step 5: Test

1. Visit: `https://admin.bizgrowthafrica.com`
2. Should see **password prompt** ✅
3. Enter credentials
4. Should see **admin dashboard** (not directory listing) ✅

## Complete .htaccess Example

Here's what your final `.htaccess` should look like (with your actual AuthUserFile path):

```apache
# Enable Rewrite Engine
RewriteEngine On

# Handle React Router - redirect all requests to index.html
# But exclude actual files and directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Password Protection (added by cPanel - DO NOT CHANGE)
AuthType Basic
AuthName "Admin Panel"
AuthUserFile /home/YOUR_USERNAME/.htpasswds/public_html/admin/passwd
Require valid-user

# Security Headers (optional)
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Content-Type-Options "nosniff"
</IfModule>
```

**Important:** Replace `YOUR_USERNAME` with your actual cPanel username, or use the exact path that cPanel generated.

## Troubleshooting

### Still No Password Prompt?

1. **Check `.htaccess` exists** in subdomain folder
2. **Verify Auth directives are present:**
   - `AuthType Basic`
   - `AuthName "Admin Panel"`
   - `AuthUserFile` (with correct path)
   - `Require valid-user`
3. **Check `.htpasswd` file exists** (cPanel creates this automatically)
4. **Clear browser cache** and try incognito window
5. **Check cPanel error logs** for Apache errors

### Getting 500 Error?

- `.htaccess` syntax might be wrong
- Check that `AuthUserFile` path is correct
- Verify file permissions (644 for `.htaccess`)

### Password Works But Shows Directory Listing?

- SPA routing rules not working
- Check `RewriteEngine On` is present
- Verify `RewriteRule . /index.html [L]` is correct

## Quick Checklist

- [ ] Removed/renamed old `.htaccess`
- [ ] Set up password protection in cPanel
- [ ] Downloaded the cPanel-generated `.htaccess`
- [ ] Added SPA routing rules at the TOP
- [ ] Kept cPanel's Auth directives intact
- [ ] Uploaded updated `.htaccess` back
- [ ] Set file permissions to 644
- [ ] Tested in incognito window

## Why This Happens

cPanel's password protection adds specific Apache directives to `.htaccess`. When you upload a custom `.htaccess`, it replaces the entire file, removing those directives. The solution is to **combine both** - your SPA routing rules AND cPanel's password protection directives.
