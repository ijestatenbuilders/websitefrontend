# Black Screen in Virtual Tour - Issue & Solution

## 🔍 Problem: Black Screen in Street View

You're seeing a black screen because **demo/test API keys don't support Google Street View**.

## Why Demo Keys Don't Work

Google Maps demo keys have severe limitations:
- ❌ No Street View access
- ❌ Limited map loads
- ❌ Watermarks on maps
- ❌ "For development purposes only" messages

## ✅ Solution: Get a Real API Key (It's Free!)

### Quick Steps:

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/

2. **Create Project**
   - Click "New Project"
   - Name it "IJ Estates"

3. **Enable Billing** (Required but you get $200 FREE monthly!)
   - Add credit card (won't be charged)
   - Google gives $200 free credit every month
   - Street View costs ~$7 per 1000 loads
   - Most websites never exceed free tier

4. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search "Maps JavaScript API"
   - Click "Enable"

5. **Create API Key**
   - Go to "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the key

6. **Add to Your Project**
   - Create `.env` file in project root:
     ```
     REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx
     ```
   - Restart server: `npm start`

7. **Test**
   - Go to Virtual Tour
   - Should now show live Street View! 🎉

## 💰 Cost Breakdown

- **FREE**: First $200 of usage every month
- **Street View**: $7 per 1,000 loads
- **Example**: 5,000 visitors/month viewing Street View = $35 (covered by free credit)
- **You only pay** if you exceed $200/month (unlikely for small-medium sites)

## 🔒 Security (Important!)

After creating your key:

1. **Restrict the API Key**:
   - Go to "Credentials"
   - Click on your API key
   - Under "API restrictions": Select "Maps JavaScript API" only
   - Under "Application restrictions": Add `localhost/*` and your domain

2. **Never commit API key to git**:
   - Use `.env` file (already in `.gitignore`)
   - Never hardcode in source files

## 🆘 Still Having Issues?

### Check Browser Console:
```
Press F12 → Console tab
```

### Common Errors:

**"RefererNotAllowedMapError"**
- Solution: Add your domain to API key restrictions

**"ApiNotActivatedMapError"**
- Solution: Enable "Maps JavaScript API" in Cloud Console

**"This API project is not authorized"**
- Solution: Enable billing (even for free tier)

**Black screen but no errors**
- Solution: Location may not have Street View coverage
- Try: Open Google Maps, check if Street View is available at Bahria Town

## 📍 Alternative: Use Different Location

If Bahria Town doesn't have Street View, try these locations in `MapView.jsx`:

```javascript
// Lahore Fort (has Street View)
{ lat: 31.5880, lng: 74.3154 }

// Minar-e-Pakistan (has Street View)  
{ lat: 31.5900, lng: 74.3095 }

// Liberty Market Lahore (has Street View)
{ lat: 31.5088, lng: 74.3405 }
```

## 📞 Need Help?

1. Check `GOOGLE_MAPS_SETUP.md` for detailed setup
2. Google Maps Support: https://developers.google.com/maps/support
3. Check Google Cloud Console for billing/API status

---

## ⚡ TL;DR

**Demo keys = No Street View = Black screen**

**Real API key = Free $200/month = Works perfectly!**

Get your key in 5 minutes at: https://console.cloud.google.com/
