# Google Maps API Setup Instructions

## 🗺️ Quick Start (5 minutes)

### ⚡ Fast Setup Steps:

1. **Get API Key** (2 min):
   - Go to: https://console.cloud.google.com/
   - Create project → Enable "Maps JavaScript API" → Create API Key

2. **Add to Project** (1 min):
   - Copy `.env.example` to `.env`
   - Paste your API key in `.env`:
     ```
     REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBIwzAIlpxe_vfW3VQvS9Ek0V_5m8qLj5Q
     ```

3. **Restart Server**:
   ```bash
   npm start
   ```

4. **Test**: Navigate to Map View → Virtual Tour → Start Virtual Tour

---

## 📋 Detailed Instructions

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. **Note**: You'll need to add a payment method (credit card), but Google provides **$200 free credit per month**

### Step 2: Create a New Project
1. Click on the project dropdown at the top left
2. Click "New Project"
3. Name it "IJ Estates" or any name you prefer
4. Click "Create"
5. Wait for project creation (~30 seconds)

### Step 3: Enable Required APIs
1. Click "☰" menu → "APIs & Services" → "Library"
2. Search for **"Maps JavaScript API"**
3. Click on it → Click "Enable"
4. Wait for activation (~1 minute)

### Step 4: Enable Billing (Required even for free tier)
1. Click "☰" menu → "Billing"
2. Click "Link a billing account" or "Manage billing accounts"
3. Click "Add billing account"
4. Enter your payment details
5. **Don't worry**: You get $200 free credit monthly and won't be charged unless you exceed it

### Step 5: Create API Key
1. Click "☰" menu → "APIs & Services" → "Credentials"
2. Click "Create Credentials" at the top
3. Select "API Key"
4. Copy the generated API key (starts with AIza...)
5. Click "Close"

### Step 6: Secure Your API Key (Important!)
1. Click on your newly created API key name
2. Under **"API restrictions"**:
   - Select "Restrict key"
   - Check only: **Maps JavaScript API**
3. Under **"Application restrictions"**:
   - Select "HTTP referrers (websites)"
   - Click "Add an item"
   - Add: `localhost/*` (for development)
   - Add: `*.yourdomain.com/*` (replace with your domain)
4. Click "Save"

### Step 7: Add API Key to Your Project

**Option A: Using .env file (Recommended)**:
1. In your project root, find `.env.example`
2. Copy it and rename the copy to `.env`
3. Open `.env` in a text editor
4. Replace `your_google_maps_api_key_here` with your actual API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBIwzAIlpxe_vfW3VQvS9Ek0V_5m8qLj5Q
   ```
5. Save the file
6. Make sure `.env` is in `.gitignore` (it should be by default)

**Option B: Direct in code** (Not recommended for production):
1. Open: `src/Components/MapView/MapView.jsx`
2. Find line 13
3. Replace the placeholder with your key after the ||

### Step 8: Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Start again
npm start
```

### Step 9: Test the Virtual Tour
1. Open your app in browser
2. Click "View Map" in navbar
3. Click "Virtual Tour" tab
4. Click "Start Virtual Tour"
5. You should now see live Google Street View! 🎉

## 📍 Customizing the Location

To change the default Street View location, edit `MapView.jsx` around line 55:

```javascript
const bahriaLocation = { lat: 31.3414345, lng: 74.1682847 };
```

Replace with your desired coordinates.

### How to Find Coordinates:
1. Go to Google Maps
2. Right-click on your desired location
3. Click the coordinates to copy them
4. Update the `lat` and `lng` values

## 💰 Pricing Information

Google Maps offers a free tier:
- **$200 free credit per month**
- Street View usage: ~$7 per 1,000 loads
- Most small-medium websites stay within free tier

Monitor usage at: https://console.cloud.google.com/billing

## 🔒 Security Best Practices

1. **Never commit your API key to public repositories**
   - Always use `.env` file
   - Make sure `.env` is in `.gitignore`

2. **Always use API restrictions** as mentioned in Step 6

3. **Monitor your usage** regularly in Google Cloud Console

## 🆘 Troubleshooting

### "This page didn't load Google Maps correctly"?
- **Most common**: API key not set or invalid
- Check if you added the key to `.env` file
- Restart development server after adding `.env`
- Verify API key is correct (no extra spaces)
- Check if Maps JavaScript API is enabled
- Billing must be enabled (even for free tier)

### Street View shows "Sorry! Something went wrong"?
- API restrictions may be too strict
- Try removing application restrictions temporarily
- Make sure billing is enabled
- Wait 5-10 minutes after creating API key

### Black screen in Street View?
- The location may not have Street View coverage
- Try different coordinates
- Check Google Maps to verify Street View is available at that location

### "Loading Google Maps..." never completes?
- Check browser console for errors
- API key might be rejected
- Network/firewall blocking Google APIs

## 📞 Support
For Google Maps API support: https://developers.google.com/maps/support

---

**Remember**: The placeholder API key will NOT work. You MUST add your own key!
