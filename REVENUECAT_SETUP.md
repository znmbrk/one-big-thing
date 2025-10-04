# RevenueCat Setup Guide for "One Big Thing"

## Overview
This guide walks you through setting up RevenueCat for the "One Big Thing" app to enable premium subscriptions with lifetime history access.

---

## Step 1: RevenueCat Account & Project Setup

### 1.1 Create/Login to RevenueCat Account
1. Go to https://app.revenuecat.com/
2. Sign in or create a new account
3. You should already have a project set up (API key is in the code)

### 1.2 Verify Project Settings
1. Navigate to your project dashboard
2. Verify the API key matches: `appl_XnVCDkYrMoNSCnUPthacgEgRrpv`
3. If not, update `src/context/SubscriptionContext.tsx` with the correct key

---

## Step 2: App Store Connect Setup

### 2.1 Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com/
2. Navigate to **My Apps** > **+** > **New App**
3. Fill in app details:
   - **Platform**: iOS
   - **Name**: One Big Thing
   - **Bundle ID**: `com.zainmomo.onebigthing` (already in app.json)
   - **SKU**: `onebigthing` (or your preference)
   - **User Access**: Full Access

### 2.2 Create In-App Subscription
1. In your app's App Store Connect page, go to **Features** > **In-App Purchases**
2. Click the **+** button to create a new subscription
3. Select **Auto-Renewable Subscription**
4. Create a **Subscription Group** (e.g., "Premium Subscriptions")

### 2.3 Configure Subscription Product
Fill in the subscription details:

**Reference Name**: `Premium Monthly Subscription`
**Product ID**: `premium_monthly` (important - you'll need this)
**Subscription Duration**: 1 month
**Price**: £2.00/month (or your preferred pricing)

**Localization** (English - UK or US):
- **Display Name**: Premium
- **Description**: Unlock unlimited access to your lifetime history of "one big things"

**Review Information**:
- Upload a screenshot showing the premium features
- Add review notes explaining the subscription

**Save** the subscription

---

## Step 3: Connect App Store Connect to RevenueCat

### 3.1 Get App Store Connect API Key
1. In App Store Connect, go to **Users and Access** > **Integrations** > **App Store Connect API**
2. Click **Generate API Key** or use an existing one
3. Download the `.p8` file (keep it safe!)
4. Note down:
   - **Issuer ID**
   - **Key ID**
   - **Vendor Number** (from **Agreements, Tax, and Banking**)

### 3.2 Configure RevenueCat Integration
1. In RevenueCat dashboard, go to your project
2. Navigate to **Settings** > **Apple App Store**
3. Click **Configure** or **Edit**
4. Enter:
   - **App Name**: One Big Thing
   - **Bundle ID**: `com.zainmomo.onebigthing`
   - **Shared Secret**: (Get from App Store Connect > My Apps > Your App > App Information)
5. Upload the App Store Connect API Key:
   - Upload the `.p8` file
   - Enter Issuer ID
   - Enter Key ID
6. Enter **Vendor Number**
7. Click **Save**

---

## Step 4: Configure Entitlements in RevenueCat

### 4.1 Create Entitlement
1. In RevenueCat, go to **Entitlements**
2. Click **+ New Entitlement**
3. Enter:
   - **Identifier**: `premium` (IMPORTANT: must match code)
   - **Display Name**: Premium Access
   - **Description**: Unlimited access to lifetime history
4. Click **Save**

### 4.2 Create Product in RevenueCat
1. Go to **Products** section
2. Click **+ New**
3. Select **App Store**
4. Enter the **Product ID**: `premium_monthly` (must match App Store Connect)
5. Click **Save**

### 4.3 Create Offering
1. Go to **Offerings** section
2. You should see a "default" offering - click to edit
3. Click **Add Package**
4. Configure package:
   - **Identifier**: `$rc_monthly` (or custom like `premium_monthly_package`)
   - **Product**: Select `premium_monthly`
   - **Entitlement**: Select `premium`
5. Click **Save**
6. Make sure this offering is set as **Current** (toggle switch)

---

## Step 5: Testing Setup

### 5.1 Create Sandbox Test Account
1. In App Store Connect, go to **Users and Access** > **Sandbox Testers**
2. Click **+** to create a new sandbox tester
3. Fill in details:
   - Email (use a unique email like `test+onebigthing@yourdomain.com`)
   - Password
   - Region: Your country
4. Click **Create**

### 5.2 Configure Device for Testing
1. On your iPhone, sign out of your real Apple ID in App Store (NOT in Settings > Apple ID)
2. Don't sign in with sandbox account yet - wait for app to prompt

### 5.3 Enable Dev Mode Testing
In the app code, you can toggle premium without purchasing:

**File**: `src/context/SubscriptionContext.tsx`
**Line**: 16

Change:
```typescript
const DEV_FORCE_PREMIUM = false;
```

To:
```typescript
const DEV_FORCE_PREMIUM = true;
```

This simulates premium status without requiring a purchase.

---

## Step 6: Verify Integration

### 6.1 Check RevenueCat Dashboard
1. Go to **Overview** in RevenueCat
2. Verify you see:
   - ✓ App Store configured
   - ✓ Products created
   - ✓ Entitlements created
   - ✓ Offerings configured

### 6.2 Test in App
1. Build and run the app on your device
2. Navigate to History screen
3. Try to upgrade to premium:
   - You should see the upgrade modal
   - Tap "Upgrade to Premium"
   - App Store sheet should appear
   - Sign in with sandbox account when prompted
4. Complete the purchase
5. App should automatically detect premium status

---

## Troubleshooting

### "No offerings available"
- Check that your offering is marked as "Current" in RevenueCat
- Verify the product ID matches between App Store Connect and RevenueCat
- Wait 15-30 minutes after creating products (Apple's servers need time)

### "Product not found"
- Ensure product is approved and ready for sale in App Store Connect
- Check that Bundle ID matches exactly
- Verify App Store Connect integration in RevenueCat

### "Purchase failed"
- Make sure you're signed in with a sandbox account
- Check that the subscription is in "Ready to Submit" or approved status
- Verify the sandbox account is valid and for the correct region

### "Premium status not detected"
- Check the entitlement identifier is exactly `premium`
- Look at RevenueCat logs in dashboard under **Customer History**
- Verify `isPremium` logic in `checkSubscriptionStatus` function

---

## Production Checklist

Before releasing to production:

- [ ] Set `DEV_FORCE_PREMIUM = false` in SubscriptionContext.tsx
- [ ] Remove all dev reset buttons and debug UI
- [ ] Test subscription purchase with real device + sandbox account
- [ ] Verify subscription restoration works after app reinstall
- [ ] Test subscription cancellation and expiry flows
- [ ] Upload final build to App Store Connect
- [ ] Submit for review with in-app purchase details
- [ ] Enable subscription for sale after approval

---

## Important Notes

1. **Sandbox Testing**: Sandbox subscriptions auto-renew much faster (e.g., 5 minutes for a monthly subscription)
2. **Product IDs**: These must match exactly between App Store Connect and RevenueCat
3. **Entitlement Name**: The code checks for `entitlements.active.premium` - this must match RevenueCat
4. **API Key**: Already configured in code, verify it matches your RevenueCat project
5. **Bundle ID**: `com.zainmomo.onebigthing` - must be consistent everywhere

---

## Quick Reference

**Bundle ID**: `com.zainmomo.onebigthing`
**RevenueCat API Key**: `appl_XnVCDkYrMoNSCnUPthacgEgRrpv`
**Product ID**: `premium_monthly` (recommended)
**Entitlement ID**: `premium` (required)
**Price**: £2/month (recommended)

---

## Next Steps After Setup

Once RevenueCat is configured:
1. Test the full purchase flow
2. Verify premium features unlock correctly
3. Test subscription restoration
4. Prepare App Store listing
5. Submit for review
