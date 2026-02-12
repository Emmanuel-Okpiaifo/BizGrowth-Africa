# Admin Panel Deployment

Use this when **admin changes work locally** (`npm run preview:admin`) but **don’t appear after deploy**.

## 1. Build the admin app before deploying

```bash
npm run build:admin
```

This outputs to the **`dist-admin`** folder and renames `index.admin.html` → `index.html`.

## 2. Deploy the correct folder

- **Admin subdomain/URL** (e.g. `admin.bizgrowthafrica.com`) must be served from the **contents of `dist-admin`**, not `dist`.
- Upload **everything inside `dist-admin`** (including `index.html`, `assets/`, favicons, etc.) to the **document root** of the admin site.

## 3. Stop caching of `index.html` (most common fix)

**Note:** Each `npm run build:admin` writes a **`.htaccess`** into `dist-admin` that tells Apache not to cache `index.html`. If your admin site runs on **Apache**, upload that `.htaccess` with the rest of `dist-admin` and the cache fix is applied automatically. If you use Nginx, Cloudflare, or another cache, see below.

If the server or CDN caches `index.html`, users keep getting the old page and old script names, so your new build never loads.

**Do one of the following:**

- **Apache** (e.g. in the admin site’s `.htaccess` or vhost):
  ```apache
  <Files "index.html">
    Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
  </Files>
  ```
- **Nginx** (in the server block for the admin site):
  ```nginx
  location = /index.html {
    add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";
  }
  ```
- **cPanel / host “Cache” or “CDN”**  
  Disable caching for the admin domain or exclude `index.html` from cache.
- **Cloudflare**  
  Create a Page Rule for the admin URL: “Cache Level” = Bypass, or exclude `index.html`.

After changing cache settings, do a **hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) or test in an incognito window.

## 4. Confirm which build is live

After deploying:

1. Open the admin site.
2. **View Page Source** (e.g. right‑click → View Page Source).
3. In the `<head>` you should see a comment like:
   ```html
   <!-- Admin build: 2025-02-07T14:30:00.000Z -->
   ```
   That timestamp is from when you ran `npm run build:admin`. If it’s old, the server is still serving a cached or old `index.html`.

## 5. Checklist

- [ ] Run `npm run build:admin` before uploading.
- [ ] Upload the **contents of `dist-admin`** to the **admin** document root (not `dist`).
- [ ] Ensure `index.html` is **not cached** (or cache is bypassed for the admin site).
- [ ] Hard refresh or incognito to test; check the build timestamp in View Source.
