# Instagram API Integration Setup

## Overview
The Instagram section on the main page can now display real posts from your @georgiantrip_go account.

## Setup Options

### Option 1: Instagram Basic Display API (Recommended for production)
1. **Create Facebook Developer Account**
   - Go to https://developers.facebook.com/
   - Create a new app

2. **Set up Instagram Basic Display**
   - Add Instagram Basic Display product to your app
   - Configure Instagram testers (add your Instagram account)
   - Get approval from Facebook

3. **Get API Credentials**
   - Obtain Access Token
   - Get User ID

4. **Configure Environment Variables**
   ```bash
   VITE_INSTAGRAM_ACCESS_TOKEN=your_access_token_here
   VITE_INSTAGRAM_USER_ID=your_user_id_here
   ```

### Option 2: Specific Post URLs (Quick setup)
Add specific Instagram post URLs to display:

```bash
VITE_INSTAGRAM_POST_URLS=https://www.instagram.com/p/POST_ID_1/,https://www.instagram.com/p/POST_ID_2/
```

### Option 3: Fallback (Current)
If no API credentials are provided, the system uses beautiful Georgia-themed fallback images.

## Features
- ✅ Real Instagram posts integration
- ✅ Automatic fallback to curated images
- ✅ Clickable posts that open in new tabs
- ✅ Responsive design
- ✅ Error handling

## Current Status
- 🔄 API integration code is ready
- 🔄 Environment configuration files created
- 🔄 Fallback system active
- ⏳ Waiting for Instagram API credentials

## Next Steps
1. Set up Instagram Basic Display API
2. Add credentials to `.env` file
3. Test the integration
4. Deploy to production

## Files Modified
- `src/lib/instagramService.js` - Main API integration
- `src/components/home-sections/InstagramFeedSection.jsx` - UI updates
- `.env` - Local environment variables
- `.env.example` - Configuration template