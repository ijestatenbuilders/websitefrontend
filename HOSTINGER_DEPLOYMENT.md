# Hostinger Deployment Guide - IJ Estates Frontend

## The Problem
When you refresh pages like `/listings` or `/property/123` on Hostinger, you get a 404 error. This happens because:
- React Router handles routing on the client-side
- When you refresh, the server looks for actual files at those paths
- The server doesn't find them and returns 404

## The Solution
The `.htaccess` file tells Apache (Hostinger's web server) to redirect all requests to `index.html`, allowing React Router to handle the routing.

---

## Step-by-Step Deployment to Hostinger

### 1. Build Your React App Locally

```bash
cd "d:\Coding\IJ ESTATES\ijestate"
npm run build
```

This creates a `build` folder with all your production files including the `.htaccess` file from the `public` folder.

### 2. Verify `.htaccess` is in Build Folder

After building, check that the `.htaccess` file is present:
```
ijestate/build/.htaccess
```

The `.htaccess` file should contain:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

### 3. Upload to Hostinger

**Via File Manager:**
1. Log into Hostinger control panel
2. Go to **File Manager**
3. Navigate to `public_html` (or your domain's root directory)
4. **Delete all old files** from previous deployment
5. Upload **everything** from your `build` folder to `public_html`
6. Make sure `.htaccess` is visible (you may need to enable "Show Hidden Files")

**Via FTP:**
1. Connect to Hostinger via FTP (FileZilla, WinSCP, etc.)
2. Navigate to `public_html` directory
3. Delete old files
4. Upload all contents from `build` folder
5. Ensure `.htaccess` is uploaded (check "Show hidden files" in your FTP client)

### 4. Verify on Hostinger

After upload, your `public_html` should contain:
```
public_html/
├── .htaccess          ← MUST BE HERE
├── index.html
├── favicon.ico
├── logo.jpg
├── manifest.json
├── robots.txt
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── asset-manifest.json
```

### 5. Test the Fix

1. Visit your domain: `https://yourdomain.com`
2. Navigate to `/listings` page
3. **Refresh the page** (F5 or Ctrl+R)
4. It should **NOT** show 404 - should load the listings page correctly
5. Test other routes: `/property/1`, `/about`, `/contact`, etc.

---

## Common Issues & Fixes

### Issue 1: Still Getting 404 After Upload
**Cause:** `.htaccess` file not uploaded or in wrong location

**Fix:**
- Make sure `.htaccess` is in the root of `public_html` (not in a subfolder)
- Enable "Show Hidden Files" in File Manager/FTP
- Check file permissions: `.htaccess` should be `644`

### Issue 2: Internal Server Error (500)
**Cause:** Syntax error in `.htaccess` or mod_rewrite not enabled

**Fix:**
- Contact Hostinger support to enable `mod_rewrite` module
- Verify `.htaccess` syntax is correct (copy from this guide)

### Issue 3: Homepage Works, Other Routes 404
**Cause:** `.htaccess` is missing or not working

**Fix:**
- Re-upload `.htaccess` to `public_html` root
- Check with Hostinger if Apache mod_rewrite is enabled
- Try clearing browser cache and hard refresh (Ctrl+Shift+R)

### Issue 4: API Calls Failing
**Cause:** API_URL environment variable not set correctly

**Fix:**
- Check your `.env.production` file has the correct backend URL:
  ```
  REACT_APP_API_URL=https://your-backend-domain.com
  ```
- Rebuild after changing environment variables

---

## Quick Upload Script (PowerShell)

If you want to automate building and preparing for upload:

```powershell
# Navigate to project
cd "d:\Coding\IJ ESTATES\ijestate"

# Build the project
npm run build

# Open build folder
explorer.exe ".\build"

# Now manually upload everything from build folder to Hostinger public_html
```

---

## Important Notes

1. **Always build before uploading** - Never upload source files
2. **Clear browser cache** after deployment to see changes
3. **Enable mod_rewrite** on Hostinger (usually enabled by default)
4. **Check .htaccess permissions** - Should be `644`
5. **Test all routes** after deployment, not just homepage

---

## Hostinger-Specific Settings

### Enable mod_rewrite (if needed)
1. Contact Hostinger Support via live chat
2. Request: "Please enable mod_rewrite module for my domain"
3. Wait for confirmation (usually instant)

### PHP Version
- Not relevant for React frontend (only for backend)
- But if you have backend on same hosting, use PHP 8.1+

### SSL Certificate
- Enable SSL in Hostinger panel (free with hosting)
- Update environment variables to use `https://` URLs

---

## Verification Checklist

After deployment, verify:
- ✅ Homepage loads: `https://yourdomain.com/`
- ✅ Listings page loads: `https://yourdomain.com/listings`
- ✅ Listings page **refreshes** without 404
- ✅ Property detail page loads: `https://yourdomain.com/property/1`
- ✅ Property detail **refreshes** without 404
- ✅ About page loads and refreshes
- ✅ Contact page loads and refreshes
- ✅ Business Bay Commercial loads and refreshes
- ✅ Non-existent routes show 404 page: `https://yourdomain.com/random-page`
- ✅ Images load correctly
- ✅ API calls work (if backend is connected)

---

## Need Help?

If issues persist:
1. Check Hostinger error logs (in File Manager > Error Logs)
2. Contact Hostinger support via live chat
3. Share this guide with them to explain what you're trying to do

---

## Summary

The `.htaccess` file in `public/.htaccess` is already configured correctly. When you run `npm run build`, it will be copied to the `build` folder automatically. Just upload everything from the `build` folder to Hostinger's `public_html` directory, and your routing will work perfectly!
