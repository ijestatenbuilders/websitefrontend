# Deploy Frontend to Vercel

## Quick Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import `ijestatenbuilders/websitefrontend` repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Click **"Deploy"**

### 3. Your App Will Be Live At:
```
https://ijestateandbuilders.vercel.app
```

## Configuration

### Environment Variables (Not Needed!)
The app is already configured to use the production backend:
- API URL: `https://www.ijestateandbuilders.tech`
- No environment variables required!

### Custom Domain (Optional)
If you want to use a custom domain:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Backend Configuration ✅

Backend is already configured to accept requests from Vercel:
- ✅ ALLOWED_HOSTS includes `ijestateandbuilders.vercel.app`
- ✅ CORS allows Vercel domain
- ✅ Both HTTP and HTTPS supported

## Testing After Deployment

Visit your Vercel URL and verify:
- [ ] Home page loads
- [ ] Properties section works
- [ ] Property listings page loads
- [ ] Property detail pages work
- [ ] Contact form submits successfully
- [ ] BBC commercial section displays
- [ ] No CORS errors in browser console (F12)

## Automatic Deployments

Once connected to GitHub:
- ✅ Push to `main` → Vercel auto-deploys production
- ✅ Every PR → Vercel creates preview deployment
- ✅ Zero configuration needed!

## Local Development

```bash
npm start
# Runs on http://localhost:3000
# API calls go to production backend
```

## Build Locally

```bash
npm run build
# Creates optimized build in /build folder
```

## Troubleshooting

### CORS Errors
If you see CORS errors in console:
- Check backend logs to verify Vercel domain is in CORS_ALLOWED_ORIGINS
- Restart Gunicorn on VPS: `sudo systemctl restart gunicorn`

### API Not Loading
- Verify backend is running: `https://www.ijestateandbuilders.tech/api/properties/`
- Check browser Network tab (F12) for failed requests
- Ensure backend ALLOWED_HOSTS includes Vercel domain

### Build Fails
- Check Node version (should be 14+)
- Delete `node_modules` and `package-lock.json`, run `npm install` again
- Check build logs in Vercel dashboard

## Summary

✅ **Backend**: Configured to accept Vercel requests  
✅ **Frontend**: Already pointing to production API  
✅ **CORS**: Properly configured  
✅ **Ready**: Just deploy to Vercel!  

Your app will work immediately after Vercel deployment! 🚀
