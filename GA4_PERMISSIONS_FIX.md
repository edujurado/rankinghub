# GA4 Permissions Fix Guide

## 🔍 **Step 1: Run Debug Test**

First, let's identify the exact issue:

```bash
# Visit this URL in your browser
http://localhost:3000/api/analytics/debug
```

This will show you detailed information about what's failing.

## 🔧 **Step 2: Fix Service Account Permissions**

The error `PERMISSION_DENIED` means your service account doesn't have access to the GA4 property. Here's how to fix it:

### **Option A: Grant Access via Google Analytics (Recommended)**

1. **Go to Google Analytics:**
   - Visit: https://analytics.google.com/
   - Select your property: "RankingHub Analytics"

2. **Add Service Account:**
   - Click the **Admin** gear icon (bottom left)
   - In the **Property** column, click **Property Access Management**
   - Click the **+** button
   - Add email: `rankinghub-ga4-service-account@rankinghub-analitycs.iam.gserviceaccount.com`
   - Select role: **Viewer**
   - Click **Add**

3. **Also try Account Level Access:**
   - In the same Admin section
   - Go to **Account** column (top level)
   - Click **Account Access Management**
   - Add the same email with **Viewer** role

### **Option B: Grant Access via Google Cloud Console**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select project: `rankinghub-analitycs`

2. **Enable APIs:**
   - Go to **APIs & Services** → **Library**
   - Search for "Google Analytics Data API"
   - Click **Enable**

3. **Check Service Account:**
   - Go to **IAM & Admin** → **IAM**
   - Find: `rankinghub-ga4-service-account@rankinghub-analitycs.iam.gserviceaccount.com`
   - Ensure it has these roles:
     - **Viewer** (for GA4 access)
     - **Google Analytics Data API** access

## 🔧 **Step 3: Alternative Solutions**

### **Solution 1: Use Different Property ID Format**

Your current Property ID is `507764257`. Try these formats in your `.env.local`:

```bash
# Try these different formats
GA4_PROPERTY_ID=507764257
# OR
GA4_PROPERTY_ID=properties/507764257
# OR  
GA4_PROPERTY_ID=507764257
```

### **Solution 2: Verify Property ID**

1. **Get the correct Property ID:**
   - Go to Google Analytics → Admin
   - In **Property** column, click **Property Settings**
   - Copy the **Property ID** (should be numeric like `507764257`)

2. **Check if it's a GA4 property:**
   - Make sure you're using a GA4 property, not Universal Analytics
   - GA4 properties have numeric IDs
   - Universal Analytics properties have format like `UA-XXXXXXXX-X`

### **Solution 3: Create New Service Account**

If the current service account doesn't work:

1. **Create new service account:**
   - Go to Google Cloud Console → IAM & Admin → Service Accounts
   - Click **Create Service Account**
   - Name: `rankinghub-ga4-new`
   - Grant roles: **Viewer**

2. **Generate new key:**
   - Click on the new service account
   - Go to **Keys** tab
   - Click **Add Key** → **Create New Key** → **JSON**
   - Download and update your `.env.local`

## 🧪 **Step 4: Test the Fix**

After making changes:

1. **Test debug endpoint:**
   ```
   http://localhost:3000/api/analytics/debug
   ```

2. **Test summary endpoint:**
   ```
   http://localhost:3000/api/analytics/summary
   ```

3. **Check admin dashboard:**
   ```
   http://localhost:3000/admin
   ```
   Go to **Analytics** tab

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Property not found"**
- **Solution:** Verify the Property ID is correct
- **Check:** Go to GA4 Admin → Property Settings → Property ID

### **Issue 2: "Service account not found"**
- **Solution:** Verify the service account email is correct
- **Check:** Google Cloud Console → IAM & Admin → Service Accounts

### **Issue 3: "API not enabled"**
- **Solution:** Enable Google Analytics Data API
- **Check:** Google Cloud Console → APIs & Services → Library

### **Issue 4: "Insufficient permissions"**
- **Solution:** Grant access in Google Analytics
- **Check:** GA4 Admin → Property Access Management

## 📋 **Quick Checklist**

- [ ] Service account added to GA4 Property Access Management
- [ ] Service account added to GA4 Account Access Management  
- [ ] Google Analytics Data API enabled in Google Cloud Console
- [ ] Property ID is correct (numeric, not UA- format)
- [ ] Service account has Viewer role
- [ ] Environment variables are set correctly
- [ ] Restarted development server after env changes

## 🔄 **If Still Not Working**

Try this alternative approach - use a different authentication method:

1. **Create a new GA4 property** (as a test)
2. **Grant the service account access to the new property**
3. **Test with the new property ID**
4. **If that works, the issue is with the original property permissions**

Let me know what the debug endpoint shows, and I can provide more specific guidance!
