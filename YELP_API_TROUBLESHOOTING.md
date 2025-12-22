# Yelp API 401 Error - Troubleshooting Guide

If you're getting a **401 Unauthorized** error from the Yelp API, follow these steps:

## Quick Fix Checklist

1. ✅ **Verify your API key is correct**
   - Go to https://www.yelp.com/developers/v3/manage_app
   - Copy your **API Key** (Bearer Token)
   - It should be a long string (128+ characters)

2. ✅ **Check your `.env` or `.env.local` file**
   ```env
   YELP_API_KEY=your_actual_api_key_here
   ```
   - Make sure there are **NO quotes** around the API key
   - Make sure there are **NO spaces** before or after the `=`
   - Make sure the API key is on a single line (no line breaks)

3. ✅ **Verify the API key format**
   - Should look like: `abcdefghijklmnopqrstuvwxyz1234567890...` (very long)
   - Should NOT have quotes: `"your_key"` ❌
   - Should NOT have spaces: ` your_key ` ❌

4. ✅ **Check API key permissions**
   - Your API key must have access to the **Business Search** endpoint
   - Some API keys are restricted to specific endpoints
   - Make sure your app has the right permissions enabled

5. ✅ **Verify API key hasn't expired**
   - Yelp API keys can expire
   - Generate a new one if needed

## Step-by-Step Fix

### Step 1: Get Your API Key

1. Go to https://www.yelp.com/developers/v3/manage_app
2. Log in to your Yelp account
3. Find your app (or create a new one)
4. Copy the **API Key** (also called "Bearer Token")

### Step 2: Add to Environment File

Create or edit `.env.local` in your project root:

```env
YELP_API_KEY=your_actual_api_key_pasted_here
```

**Important:**
- No quotes
- No spaces
- No line breaks
- Just: `YELP_API_KEY=your_key`

### Step 3: Test the API Key

Run the import script - it will now test your API key first:

```bash
node scripts/bulk-import-mvp2.js
```

The script will:
1. Validate the API key format
2. Test it with a simple search
3. Show clear error messages if something is wrong

## Common Mistakes

### ❌ Wrong:
```env
YELP_API_KEY="your_key_here"
YELP_API_KEY= your_key_here
YELP_API_KEY=your_key_here 
YELP_API_KEY='your_key_here'
```

### ✅ Correct:
```env
YELP_API_KEY=your_key_here
```

## Still Getting 401?

1. **Double-check the API key**
   - Copy it again from Yelp Developer Console
   - Make sure you copied the entire key (it's very long)

2. **Try generating a new API key**
   - Sometimes keys get corrupted or have issues
   - Generate a fresh one from Yelp

3. **Check your Yelp account status**
   - Make sure your Yelp Developer account is active
   - Verify you haven't exceeded any limits

4. **Verify endpoint access**
   - The API key must have access to `/v3/businesses/search`
   - Check your app permissions in Yelp Developer Console

## Getting Help

If you've tried everything and still get 401:

1. Check the error message details in the console
2. Verify your API key works in the Yelp API playground:
   https://www.yelp.com/developers/documentation/v3/get_started
3. Contact Yelp Developer Support if needed

## Example Working .env.local File

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# Google Places API
GOOGLE_PLACES_API_KEY=your_google_key

# Yelp Fusion API
YELP_API_KEY=your_very_long_yelp_api_key_here_no_quotes_no_spaces

# Cron Secret
CRON_SECRET=your_random_secret
```

---

**Note:** The updated import script now includes better error messages and API key validation. It will tell you exactly what's wrong with your API key setup.





