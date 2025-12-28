# Database Migration for Push Notifications

## Committees CMS

Create core tables to manage committees and their sub-pages dynamically.

```sql
-- Committees
CREATE TABLE IF NOT EXISTS public.committees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  hero_title text,
  hero_subtitle text,
  focus text,
  description text,
  banner_image text,
  contact_email text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Committee sub pages/sections
CREATE TABLE IF NOT EXISTS public.committee_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  content text, -- markdown or html
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (committee_id, slug)
);

-- Optional: Committee members directory
CREATE TABLE IF NOT EXISTS public.committee_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id uuid NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  name text NOT NULL,
  position text,
  specialty text,
  role text,
  photo_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Storage bucket (run in Supabase SQL or create via dashboard)
-- Create bucket named 'committee_member_profile' and make it public:
-- select storage.create_bucket('committee_member_profile', public := true);
```

## Add Device Token Fields to Users Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Add device token fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS device_token TEXT,
ADD COLUMN IF NOT EXISTS device_platform TEXT,
ADD COLUMN IF NOT EXISTS device_token_updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_device_token ON users(device_token) WHERE device_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_membership_type ON users(membership_type) WHERE role = 'member';

-- Create notifications table (for user notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general', -- 'general', 'event', 'certificate', 'membership', 'payment'
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT, -- URL to navigate when notification is clicked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create notification_logs table (optional, for tracking sent notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target TEXT NOT NULL, -- 'all', 'free', 'paid', 'membership_type', 'event'
  membership_type TEXT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_by ON notification_logs(sent_by);

-- Create event_feedback table for member feedback on events
CREATE TABLE IF NOT EXISTS event_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_member_id UUID NOT NULL REFERENCES event_members(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_log_id UUID REFERENCES attendance_logs(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT NOT NULL,
  feedback_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_member_id, feedback_date) -- One feedback per day per event member
);

CREATE INDEX IF NOT EXISTS idx_event_feedback_event_id ON event_feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_user_id ON event_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_event_member_id ON event_feedback(event_member_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_feedback_date ON event_feedback(feedback_date DESC);
CREATE INDEX IF NOT EXISTS idx_event_feedback_created_at ON event_feedback(created_at DESC);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'free', 'active', 'associate', 'honorary', 'student'
  display_name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  registration_fee DECIMAL(10, 3) DEFAULT 0,
  annual_fee DECIMAL(10, 3) DEFAULT 0,
  registration_waived BOOLEAN DEFAULT FALSE,
  annual_waived BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  icon_name TEXT, -- For icon reference
  governance_rights JSONB DEFAULT '[]'::jsonb, -- Array of rights
  core_benefits JSONB DEFAULT '[]'::jsonb, -- Array of benefits
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort_order ON subscription_plans(sort_order);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  subscription_plan_name TEXT NOT NULL, -- Denormalized for quick access
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'pending_payment'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT FALSE,
  registration_paid BOOLEAN DEFAULT FALSE,
  annual_paid BOOLEAN DEFAULT FALSE,
  registration_payment_id UUID REFERENCES membership_payments(id) ON DELETE SET NULL,
  annual_payment_id UUID REFERENCES membership_payments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subscription_plan_id, started_at) -- One subscription per plan per start date
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- Update users table to reference subscription plan
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_subscription_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS current_subscription_plan_name TEXT;

CREATE INDEX IF NOT EXISTS idx_users_current_subscription_plan_id ON users(current_subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_users_current_subscription_plan_name ON users(current_subscription_plan_name);

-- Update membership_payments table to support subscriptions
ALTER TABLE membership_payments
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS invoice_id TEXT,
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'myfatoorah';

CREATE INDEX IF NOT EXISTS idx_membership_payments_subscription_id ON membership_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_invoice_id ON membership_payments(invoice_id);

-- Update users table membership_status constraint to allow 'pending' status
-- This is needed for registration flow where users need to complete payment before account activation
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_membership_status_check;

ALTER TABLE users 
ADD CONSTRAINT users_membership_status_check 
CHECK (membership_status = ANY (ARRAY['active'::text, 'inactive'::text, 'blocked'::text, 'pending'::text]));

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, subtitle, description, registration_fee, annual_fee, registration_waived, annual_waived, sort_order, icon_name, governance_rights, core_benefits) VALUES
('free', 'Free Membership', 'Basic Access', 'No discount on events', 0, 0, TRUE, TRUE, 0, 'user', 
 '[]'::jsonb,
 '["Digital Membership Card with QR"]'::jsonb),
('active', 'Active Membership', 'Full Membership', 'For Bahraini dentists who fulfill all regulatory requirements. Enjoy full governance rights.', 30.000, 30.000, FALSE, FALSE, 1, 'shield',
 '["Right to Nominate", "Right to Vote", "Right to be Elected", "Attend General Assembly"]'::jsonb,
 '["Digital Membership Card with QR", "Priority Event Registration", "VIP Networking Events", "Maximum Event Discounts (50%)", "Full Voting Rights"]'::jsonb),
('associate', 'Associate Membership', 'Professional Affiliates', 'For non-Bahraini dentists and professionals in allied oral health fields within Bahrain.', 30.000, 30.000, FALSE, FALSE, 2, 'users',
 '[]'::jsonb,
 '["Digital Membership Card with QR", "Priority Event Registration", "VIP Networking Events", "Maximum Event Discounts (50%)"]'::jsonb),
('honorary', 'Honorary Membership', 'Distinguished Contributions', 'Granted by the Board of Directors to individuals with distinguished health contributions.', 0, 0, TRUE, TRUE, 3, 'award',
 '["Attend General Assembly"]'::jsonb,
 '["Digital Membership Card with QR", "Priority Event Registration", "VIP Networking Events", "Maximum Event Discounts (50%)", "Exempt from all fees"]'::jsonb),
('student', 'Student Membership', 'Future Professionals', 'For students in accredited oral and dental medicine programs in Bahrain.', 0, 30.000, TRUE, FALSE, 4, 'graduation-cap',
 '[]'::jsonb,
 '["Digital Membership Card with QR", "Priority Event Registration", "Student Networking Events", "Event Discounts (50%)", "Mentorship Opportunities"]'::jsonb)
ON CONFLICT (name) DO NOTHING;
```

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# Firebase Admin (Server-side)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

## Firebase Setup Instructions

1. Go to Firebase Console (https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Cloud Messaging API
4. Go to Project Settings > Cloud Messaging
5. Generate a Web Push certificate (VAPID key)
6. Copy the VAPID key to `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
7. Go to Project Settings > Service Accounts
8. Generate a new private key (JSON)
9. Copy the entire JSON content to `FIREBASE_SERVICE_ACCOUNT` (as a string)

