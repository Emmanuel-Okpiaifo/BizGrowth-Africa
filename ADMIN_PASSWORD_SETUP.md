# Admin Password Setup

## Overview

The admin panel now uses a **client-side authentication system** with **multiple users** that:
- ✅ Prompts for **username and password** on **every new tab**
- ✅ Clears authentication when **tab is closed**
- ✅ Uses `sessionStorage` (not `localStorage`) so it doesn't persist
- ✅ Supports multiple admin users

## Current Admin Users

The following users are configured in `src/utils/adminAuth.js`:

1. **Username:** `Admin`  
   **Password:** `]ofcwrD-!13+{v_P`

2. **Username:** `Adeola`  
   **Password:** `;4WcxRwb5&VEjPFu`

## Adding or Changing Users

To add or modify users, edit `src/utils/adminAuth.js`:

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

Then rebuild:
```bash
npm run build:admin
```

**Important:** User credentials are compiled into the JavaScript bundle. For production, consider moving this to environment variables or a secure API.

## How It Works

1. **User visits admin subdomain** → Sees login page
2. **Enters password** → Stored in `sessionStorage` (not `localStorage`)
3. **Tab closes** → `sessionStorage` automatically clears
4. **New tab opens** → Must login again

## Security Notes

### Client-Side Authentication Limitations

This is a **client-side password check** for convenience. It:
- ✅ Prevents casual access
- ✅ Requires password on every new tab
- ✅ Works without backend changes

But it:
- ⚠️ Password is visible in the compiled JavaScript
- ⚠️ Can be bypassed by someone with technical knowledge
- ⚠️ Not as secure as server-side authentication

### Recommended: Use Both Layers

For better security, use **BOTH**:
1. **HTTP Basic Auth** (cPanel password protection) - Server-side, more secure
2. **Client-side login** - Convenience layer that clears on tab close

This gives you:
- Server-side protection (HTTP Basic Auth)
- Better UX (client-side login that clears per-tab)

## Updating the Password

1. **Change `.env` file:**
   ```env
   VITE_ADMIN_PASSWORD=new_password_here
   ```

2. **Rebuild:**
   ```bash
   npm run build:admin
   ```

3. **Upload new build** to subdomain

## Troubleshooting

### Password Not Working?

1. Check `.env` file exists and has `VITE_ADMIN_PASSWORD` set
2. Rebuild the admin panel after changing `.env`
3. Clear browser cache and try again

### Still Seeing Login After Closing Tab?

- This is expected behavior! ✅
- `sessionStorage` clears when tab closes
- You need to login again in new tabs

### Want to Stay Logged In Longer?

Edit `src/components/admin/AdminAuthGuard.jsx` and change the `maxAge` value:

```javascript
const maxAge = 8 * 60 * 60 * 1000; // 8 hours (change this)
```

Or remove the session expiration check entirely.
