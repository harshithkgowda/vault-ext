# Marketplace Browser Extension

This is a Chrome/Firefox browser extension version of the marketplace app.

## Installation

### For Development:

1. **Update Configuration**:
   - Open `popup.js` and replace `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your actual Supabase credentials
   - Open `background.js` and replace `YOUR_API_URL` with your API endpoint

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension folder

3. **Load in Firefox**:
   - Open Firefox and go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

### For Production:

1. **Add Icons**:
   - Create `icons/` folder
   - Add icon16.png, icon48.png, icon128.png

2. **Build & Package**:
   - Zip all files
   - Submit to Chrome Web Store or Firefox Add-ons

## Features

- **Browse Listings**: View all active marketplace listings
- **Make Purchases**: Buy items with Razorpay integration
- **Sell Items**: Create new listings directly from the extension
- **View Purchases**: Track your purchase history
- **Compact UI**: Optimized for 400x600px extension popup

## Architecture

- **popup.html/js**: Main extension UI (vanilla JavaScript)
- **background.js**: Service worker for API calls
- **styles.css**: Extension-optimized styling
- **Supabase**: Database and authentication
- **Razorpay**: Payment processing

## Notes

- Extension uses client-side Supabase only (no server components)
- Razorpay checkout opens in new tab
- All API calls go through background service worker
- Compact design optimized for extension viewport
