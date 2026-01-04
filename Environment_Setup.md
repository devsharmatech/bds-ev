# BDS Web Application - Environment Setup Guide

## Document Version
**Version:** 1.0  
**Last Updated:** 2025-01-27

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Storage Setup](#storage-setup)
6. [Firebase Setup](#firebase-setup)
7. [Payment Gateway Setup](#payment-gateway-setup)
8. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Software

1. **Node.js**
   - Version: 18.x or higher
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm or yarn**
   - Comes with Node.js
   - Verify: `npm --version`

3. **Git**
   - Version: Latest
   - Download: https://git-scm.com/
   - Verify: `git --version`

4. **Code Editor**
   - Recommended: VS Code
   - Download: https://code.visualstudio.com/

### Required Accounts

1. **Supabase Account**
   - Sign up: https://supabase.com/
   - Create a new project

2. **Firebase Account**
   - Sign up: https://firebase.google.com/
   - Create a new project

3. **MyFatoorah Account**
   - Sign up: https://myfatoorah.com/
   - Get API keys (test and production)

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd bds-ev
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

Create `.env.local` in the root directory:

```bash
cp .env.example .env.local  # If .env.example exists
# Or create manually
```

### Step 4: Configure Environment Variables

See [Environment Variables](#environment-variables) section below.

### Step 5: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## Environment Variables

### Complete `.env.local` Template

```env
# =====================================================
# SUPABASE CONFIGURATION
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# =====================================================
# JWT SECURITY
# =====================================================
JWT_SECRET=your_very_secure_random_string_min_32_chars

# =====================================================
# FIREBASE CONFIGURATION (Client)
# =====================================================
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# =====================================================
# FIREBASE CONFIGURATION (Server)
# =====================================================
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# =====================================================
# PAYMENT GATEWAY (MYFATOORAH)
# =====================================================
NEXT_PUBLIC_MYFATOORAH_BASE_URL=https://apitest.myfatoorah.com
MYFATOORAH_EVENT_API_KEY=your_event_api_key
MYFATOORAH_SUBSCRIPTION_API_KEY=your_subscription_api_key

# =====================================================
# EMAIL CONFIGURATION (Optional)
# =====================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@bahraindentalsociety.org

# =====================================================
# APPLICATION CONFIGURATION
# =====================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Variable Descriptions

#### Supabase Variables

- **NEXT_PUBLIC_SUPABASE_URL:** Your Supabase project URL
  - Found in: Supabase Dashboard → Settings → API
- **SUPABASE_SERVICE_ROLE_KEY:** Service role key (server-side only)
  - Found in: Supabase Dashboard → Settings → API
  - ⚠️ **Never expose this in client-side code**
- **NEXT_PUBLIC_SUPABASE_ANON_KEY:** Anonymous key (optional, for client-side)
  - Found in: Supabase Dashboard → Settings → API

#### JWT Secret

- **JWT_SECRET:** Random string for signing JWT tokens
  - Generate: `openssl rand -base64 32`
  - Minimum 32 characters
  - Keep secure and never commit to version control

#### Firebase Variables

See [Firebase Setup](#firebase-setup) section for detailed instructions.

#### Payment Gateway

- **NEXT_PUBLIC_MYFATOORAH_BASE_URL:**
  - Test: `https://apitest.myfatoorah.com`
  - Production: `https://api.myfatoorah.com`
- **MYFATOORAH_EVENT_API_KEY:** API key for event payments
- **MYFATOORAH_SUBSCRIPTION_API_KEY:** API key for subscription payments
  - Get from: MyFatoorah Dashboard → API Settings

---

## Database Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com/
2. Sign up or log in
3. Click "New Project"
4. Fill in project details
5. Wait for project to be created

### Step 2: Run Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Open `Database_Schema.sql`
3. Copy and paste the entire SQL script
4. Click "Run" to execute

**Note:** Run migrations in order:
1. Core tables (users, member_profiles)
2. Events system tables
3. Membership tables
4. Content management tables
5. Notifications tables
6. Default data (subscription plans)

### Step 3: Verify Tables

Check that all tables are created:
- Go to Supabase Dashboard → Table Editor
- Verify all tables exist

### Step 4: Create Indexes

All indexes are included in `Database_Schema.sql`. Verify they are created.

---

## Storage Setup

### Step 1: Create Storage Buckets

Run these SQL commands in Supabase SQL Editor:

```sql
-- Profile Pictures Bucket
SELECT storage.create_bucket('profile_pictures', jsonb_build_object('public', true));

-- Events Bucket
SELECT storage.create_bucket('events', jsonb_build_object('public', true));

-- Gallery Bucket
SELECT storage.create_bucket('gallery', jsonb_build_object('public', true));

-- Research Bucket
SELECT storage.create_bucket('research', jsonb_build_object('public', true));

-- Committee Member Profile Bucket
SELECT storage.create_bucket('committee_member_profile', jsonb_build_object('public', true));
```

### Step 2: Configure Bucket Policies

**For Public Buckets:**
- Go to Supabase Dashboard → Storage → Policies
- Create policy: "Public Access"
- Policy: Allow SELECT for all users

**For Private Buckets (if needed):**
- Create policy: "Authenticated Access"
- Policy: Allow SELECT for authenticated users only

### Step 3: Verify Buckets

- Go to Supabase Dashboard → Storage
- Verify all buckets are created and accessible

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Enter project name
4. Follow setup wizard
5. Enable Google Analytics (optional)

### Step 2: Enable Cloud Messaging

1. Go to Firebase Console → Project Settings
2. Click "Cloud Messaging" tab
3. Enable Cloud Messaging API
4. Generate Web Push certificate (VAPID key)
5. Copy VAPID key to `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### Step 3: Get Client Configuration

1. Go to Firebase Console → Project Settings → General
2. Scroll to "Your apps"
3. Click Web icon (`</>`)
4. Register app
5. Copy configuration values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### Step 4: Get Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Copy entire JSON content to `FIREBASE_SERVICE_ACCOUNT` (as a string)

**Note:** Escape quotes if needed or use single quotes in `.env.local`

### Step 5: Configure Firebase Config File

Update `src/lib/firebaseConfig.js` with your Firebase configuration:

```javascript
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
};
```

---

## Payment Gateway Setup

### Step 1: Create MyFatoorah Account

1. Go to https://myfatoorah.com/
2. Sign up for account
3. Complete verification process

### Step 2: Get API Keys

1. Log in to MyFatoorah Dashboard
2. Go to API Settings
3. Generate API keys:
   - Event Payments Account → API Key
   - Subscription Payments Account → API Key

### Step 3: Configure Environment Variables

```env
NEXT_PUBLIC_MYFATOORAH_BASE_URL=https://apitest.myfatoorah.com  # Test environment
MYFATOORAH_EVENT_API_KEY=your_event_api_key
MYFATOORAH_SUBSCRIPTION_API_KEY=your_subscription_api_key
```

### Step 4: Test Payment Flow

1. Use test API keys in development
2. Test payment creation
3. Test payment callbacks
4. Verify database updates

### Step 5: Production Setup

1. Switch to production URL: `https://api.myfatoorah.com`
2. Use production API keys
3. Update callback URLs to production domain
4. Test thoroughly before going live

---

## Production Deployment

### Step 1: Prepare Production Environment

1. Create production Supabase project
2. Create production Firebase project
3. Get production MyFatoorah API keys
4. Set up production domain

### Step 2: Environment Variables

Create `.env.production` or set in deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key
JWT_SECRET=production_jwt_secret
NEXT_PUBLIC_MYFATOORAH_BASE_URL=https://api.myfatoorah.com
MYFATOORAH_EVENT_API_KEY=prod_event_key
MYFATOORAH_SUBSCRIPTION_API_KEY=prod_subscription_key
# ... all other production values
```

### Step 3: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard

### Step 4: Configure Domain

1. Add custom domain in Vercel
2. Update DNS records
3. Update callback URLs in MyFatoorah
4. Update Firebase authorized domains

### Step 5: Verify Deployment

1. Test all major features
2. Verify payment callbacks
3. Test notifications
4. Check file uploads
5. Monitor error logs

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem:** Cannot connect to Supabase

**Solutions:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is valid
- Verify network connectivity
- Check Supabase project status

#### 2. Firebase Notifications Not Working

**Problem:** Push notifications not received

**Solutions:**
- Verify VAPID key is correct
- Check browser notification permissions
- Verify service account JSON is valid
- Check Firebase project settings
- Ensure HTTPS in production

#### 3. Payment Gateway Errors

**Problem:** Payment creation fails

**Solutions:**
- Verify API keys are correct
- Check base URL (test vs production)
- Verify callback URLs are accessible
- Check mobile number format
- Review MyFatoorah dashboard for errors

#### 4. File Upload Failures

**Problem:** Files not uploading to Supabase

**Solutions:**
- Verify storage buckets exist
- Check bucket policies
- Verify file size limits
- Check file type restrictions
- Review Supabase storage logs

#### 5. JWT Token Errors

**Problem:** Authentication failing

**Solutions:**
- Verify `JWT_SECRET` is set
- Check token expiration
- Verify cookie settings
- Check token signature

---

## Security Checklist

### Before Production

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Review and restrict CORS
- [ ] Enable Supabase RLS policies
- [ ] Review storage bucket policies
- [ ] Use production API keys
- [ ] Remove test data
- [ ] Enable error logging
- [ ] Set up monitoring
- [ ] Configure backup strategy

---

## Maintenance

### Regular Tasks

1. **Database Backups**
   - Supabase provides automatic backups
   - Verify backup schedule
   - Test restore process

2. **Dependency Updates**
   - Regularly update npm packages
   - Review security advisories
   - Test updates in development first

3. **Monitoring**
   - Monitor error rates
   - Track payment success rates
   - Monitor storage usage
   - Review performance metrics

4. **Security Updates**
   - Rotate API keys periodically
   - Update JWT_SECRET if compromised
   - Review access logs
   - Update dependencies for security patches

---

## Support Resources

### Documentation

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Firebase: https://firebase.google.com/docs
- MyFatoorah: https://myfatoorah.readme.io/

### Community

- Next.js Discord
- Supabase Discord
- Stack Overflow

---

## Conclusion

Following this guide will set up a complete development and production environment for the BDS Web Application. Ensure all environment variables are correctly configured and all services are properly set up before deployment.

---

**Document End**

