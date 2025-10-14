# Google Analytics 4 (GA4) Setup Guide

## Overview
This guide will help you set up Google Analytics 4 integration for RankingHub, including both client-side tracking and server-side analytics data fetching.

## Prerequisites
- Google Analytics 4 property created
- Service account with GA4 Data API access
- Your GA4 Measurement ID: `G-0RR1L0RM4X`

## Step 1: Get Your GA4 Property ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property (RankingHub Analytics)
3. Go to **Admin** (gear icon) → **Property Settings**
4. Copy the **Property ID** (numeric, like `123456789`)

## Step 2: Set Up Environment Variables

Create or update your `.env.local` file with the following variables:

```bash
# Google Analytics 4 Configuration
NEXT_PUBLIC_GA_ID=G-0RR1L0RM4X
GA4_PROPERTY_ID=507764257

# Google Analytics Service Account (for server-side API access)
GA_SA_CLIENT_EMAIL=rankinghub-ga4-service-account@rankinghub-analitycs.iam.gserviceaccount.com
GA_SA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDtKInXiNYcL3YM\nXc8MftMILcwg6XiJA/sXmwrYVmknqCSpdIc8jf5n+b0dFSt1lnd50nS/5hc214Dx\ngKWf+egBv5oKu/yUlbFVzkvcgNoDtWOgB0tM0OaN1FATXRd2l7/tecIed/v+dM7v\nNKnZSy8amALauDKqjPW6nwm4LX5jvbjOp+bsARpWj5jJuaF2YRoj6vxmNfAF93fB\n6jo7QKlC26cgt3XRnUmXmWhx1BbViWB5/SpUivsaQzDTir/+OfeyTg/lOGPVUTgp\nWenFRIwdYvCXDCi1xZdM6OPfcOc5yz9aytBoddi16cxYFJxxikaig+HcxnW0RJtM\nr5LukHs/AgMBAAECggEAb+Ajxm1is8Ef6w2F0tsxKjaQiSYaGmiqVqRpJUz+JhsH\n0HiMI2DIlrwVHlcSPVJR4kIJmU0tvk1DIqoRd7ooXErKnC26JU3IbjX3S3ntXrp+\n2MsYFpClclqpu7i6jNNhUuGRVVY8pfjsdaNeTIdPHTiAgDVMkXAVq4fCygOMD/hT\nZ8whrIhALvEE5wUJb4L8lGSwrOJo7/QWugH4yraqoh1ejSwbHkQ/rrFRpR9Fz1gS\ne/hQyxxBRnlmnlTYtoCKiTYxZ97FqZlrIAbGGGRMzRO7gyx7bpe/S/GFRXKySqCn\n38yclljwjGfQ6NFYyF6mRUPhCbQlg2+VRMTSRzUioQKBgQD6wc+k7lNgrDn6Pl3S\nPl22drAm7jM6mXqbAkTnIID8T7Gttn4Lqp5CkrokBMrsoMa9+AtX250kZYBPWxk7\nU37X9v27nE8Oun1dCcUq3g2l1xZEpiq7opC6ijuujSOUG4Dx5LqGKNNZKW0aq9Aw\nSMUwRcnoLLHr7iC2lTR68WkCgwKBgQDyHfCGJokFKDiji6QC++SvO61T6mNxZ5w9\nYZtMcPhFGxvszrpBwcfUe84S/NgNxAfPwH0o/ee9taIlq8D8YBBFpFIyDX01osSU\nqS/wGKVRgyPkwRXnIyUdHnvppXBFQynr8jvolJR/LF0vIkMmjkKqBVUy+czNaZ8R\nfqjG33LXlQKBgQCOHrqpJ8ppyDMz+ZUDTAWhHLPJ3Md8NvCeWjLjLDDuz9xMMFpQ\nEmuQH8kQEQdSBe2eTa9gJEB0GHMYhvFOBoylqn80jerg1iGnUZpGKYRisf0U+3jM\nz95nW2FoFOZNUylJ7/EniIwAxNHpg+eC9juMmIFO7cYJifVQhlAwPhLeMQKBgD3r\nzEzy5A4umDWzi/G7bGQolg6lHmOthPbp1Kb7KXO7GCw7PsV8gtfkBfMzOSpkHT9T\n0m6+aRtKrbqGr6ecBe1Zti/Y5VHnW/FNR9ZW50juiiqB+1EO2voUhspdplYAdGNE\no2+7ODNCLF7Wm2fr8D69eGm+G1PZlHYL96xND3j1AoGAEqTsBzbvYjhU4KyUBJpH\nG6X6DkASuPMgqDhB0Z0Cp5p3wzp4Fd1LX7mCm/Z1r75dqmRmh3W1aSQ+QjhLIyD0\nm/FndLNJeYOvDYmbVAxYDBXAXGbbxt0AlXheHv+YUF2l5WWwwvVIaNva/kBHe69v\n7rObPxFGnSK0FIyc7Muwqj4=\n-----END PRIVATE KEY-----\n"
```

## Step 3: Verify Service Account Permissions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Find your service account: `rankinghub-ga4-service-account@rankinghub-analitycs.iam.gserviceaccount.com`
4. Ensure it has the following roles:
   - **Viewer** role for your GA4 property
   - **Google Analytics Data API** access

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin dashboard: `http://localhost:3000/admin`
3. Click on the **Analytics** tab
4. You should see the Analytics Overview widget with real-time data

## Features Implemented

### Client-Side Tracking
- **Page Views**: Automatically tracked on route changes
- **Event Tracking**: Custom events for user interactions
- **Real-time Data**: Live user activity monitoring

### Server-Side Analytics
- **API Endpoint**: `/api/analytics/summary`
- **Metrics Tracked**:
  - Active Users (last 7 days)
  - New Users (last 7 days)
  - Average Session Duration
  - Total Page Views
- **Admin Dashboard**: Real-time analytics widget

### Security
- Service account credentials stored securely in environment variables
- Server-side API calls to prevent credential exposure
- Row Level Security (RLS) for database access

## Troubleshooting

### Common Issues

1. **"GA4 environment variables are not set"**
   - Ensure all environment variables are properly set in `.env.local`
   - Restart your development server after adding variables

2. **"Failed to fetch analytics data"**
   - Check service account permissions
   - Verify Property ID is correct
   - Ensure service account has GA4 Data API access

3. **No data showing in analytics**
   - Wait 24-48 hours for initial data collection
   - Check if GA4 is properly configured on your website
   - Verify the Measurement ID is correct

### Debug Steps

1. Check browser console for GA4 tracking errors
2. Verify network requests to `/api/analytics/summary`
3. Test GA4 tracking with Google Analytics Debugger extension
4. Check server logs for API errors

## Next Steps

1. **Enhanced Analytics**: Add more detailed metrics and date ranges
2. **Custom Events**: Track specific user interactions (provider views, contact form submissions)
3. **Real-time Dashboard**: Live user activity monitoring
4. **Export Features**: Download analytics reports
5. **Alerts**: Set up notifications for traffic spikes or drops

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure service account has proper permissions
4. Test with a fresh GA4 property if needed

The integration is now complete and ready for production use!
