-- =====================================================
-- BDS Web Application - Complete Database Schema
-- =====================================================
-- Database: PostgreSQL (via Supabase)
-- Version: 1.0
-- Last Updated: 2025-01-27
-- =====================================================

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users Table
-- Stores all user accounts (admins and members)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  full_name_ar TEXT,
  phone TEXT,
  mobile TEXT,
  profile_image TEXT,
  membership_code TEXT UNIQUE,
  membership_type TEXT CHECK (membership_type IN ('free', 'paid')) DEFAULT 'free',
  membership_status TEXT CHECK (membership_status IN ('active', 'inactive', 'blocked', 'pending')) DEFAULT 'inactive',
  membership_expiry_date TIMESTAMP WITH TIME ZONE,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_member_verified BOOLEAN DEFAULT FALSE,
  current_subscription_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  current_subscription_plan_name TEXT,
  device_token TEXT,
  device_platform TEXT,
  device_token_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_membership_type ON users(membership_type) WHERE role = 'member';
CREATE INDEX IF NOT EXISTS idx_users_membership_status ON users(membership_status);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_device_token ON users(device_token) WHERE device_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_current_subscription_plan_id ON users(current_subscription_plan_id);

-- Member Profiles Table
-- Extended information for members
CREATE TABLE IF NOT EXISTS public.member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gender TEXT,
  dob DATE,
  nationality TEXT,
  cpr_id TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pin_code TEXT,
  category TEXT,
  work_sector TEXT,
  employer TEXT,
  position TEXT,
  specialty TEXT,
  type_of_application TEXT,
  membership_date DATE,
  license_number TEXT,
  years_of_experience TEXT,
  id_card_url TEXT,
  personal_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON member_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_cpr_id ON member_profiles(cpr_id);

-- =====================================================
-- EVENTS SYSTEM
-- =====================================================

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  venue_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  capacity INTEGER,
  status TEXT CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
  featured_image TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Event Members Table
-- Tracks event registrations
CREATE TABLE IF NOT EXISTS public.event_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_paid DECIMAL(10, 3) DEFAULT 0,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON event_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_user_id ON event_members(user_id);
CREATE INDEX IF NOT EXISTS idx_event_members_token ON event_members(token);
CREATE INDEX IF NOT EXISTS idx_event_members_checked_in ON event_members(checked_in);

-- Attendance Logs Table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_member_id UUID NOT NULL REFERENCES event_members(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_event_id ON attendance_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_id ON attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_event_member_id ON attendance_logs(event_member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_checked_in_at ON attendance_logs(checked_in_at DESC);

-- Event Hosts Table
CREATE TABLE IF NOT EXISTS public.event_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profile_image TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  bio TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_hosts_event_id ON event_hosts(event_id);

-- Event Agendas Table
CREATE TABLE IF NOT EXISTS public.event_agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  agenda_date DATE,
  title TEXT NOT NULL,
  start_time TIME,
  end_time TIME,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_agendas_event_id ON event_agendas(event_id);

-- Event Feedback Table
CREATE TABLE IF NOT EXISTS public.event_feedback (
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
  UNIQUE(event_member_id, feedback_date)
);

CREATE INDEX IF NOT EXISTS idx_event_feedback_event_id ON event_feedback(event_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_user_id ON event_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_event_feedback_event_member_id ON event_feedback(event_member_id);

-- =====================================================
-- MEMBERSHIP & SUBSCRIPTIONS
-- =====================================================

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  registration_fee DECIMAL(10, 3) DEFAULT 0,
  annual_fee DECIMAL(10, 3) DEFAULT 0,
  registration_waived BOOLEAN DEFAULT FALSE,
  annual_waived BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  icon_name TEXT,
  governance_rights JSONB DEFAULT '[]'::jsonb,
  core_benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort_order ON subscription_plans(sort_order);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  subscription_plan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT FALSE,
  registration_paid BOOLEAN DEFAULT FALSE,
  annual_paid BOOLEAN DEFAULT FALSE,
  registration_payment_id UUID REFERENCES membership_payments(id) ON DELETE SET NULL,
  annual_payment_id UUID REFERENCES membership_payments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subscription_plan_id, started_at)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- Membership Payments Table
CREATE TABLE IF NOT EXISTS public.membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  payment_type TEXT,
  amount DECIMAL(10, 3) NOT NULL,
  currency TEXT DEFAULT 'BHD',
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  invoice_id TEXT,
  payment_gateway TEXT DEFAULT 'myfatoorah',
  reference TEXT,
  membership_start_date DATE,
  membership_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_membership_payments_user_id ON membership_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_subscription_id ON membership_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_paid ON membership_payments(paid);
CREATE INDEX IF NOT EXISTS idx_membership_payments_invoice_id ON membership_payments(invoice_id);

-- =====================================================
-- CONTENT MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS public.committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hero_title TEXT,
  hero_subtitle TEXT,
  focus TEXT,
  description TEXT,
  banner_image TEXT,
  contact_email TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_committees_slug ON committees(slug);
CREATE INDEX IF NOT EXISTS idx_committees_is_active ON committees(is_active);

-- Committee Sections Table
CREATE TABLE IF NOT EXISTS public.committee_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  -- Optional rich section layout fields for the public committee page
  image_url TEXT,
  image_alignment TEXT CHECK (image_alignment IN ('left', 'right', 'full')) DEFAULT 'left',
  button_label TEXT,
  button_url TEXT,
  show_button BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_committee_sections_committee_id ON committee_sections(committee_id);

-- Gallery Table
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  featured_image_url TEXT,
  tag1 TEXT,
  tag2 TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_galleries_slug ON galleries(slug);
CREATE INDEX IF NOT EXISTS idx_galleries_is_active ON galleries(is_active);

-- Gallery Images Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_id ON gallery_images(gallery_id);

-- Research Table
CREATE TABLE IF NOT EXISTS public.research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- Research category (e.g., Clinical Studies, Case Reports, Review Articles)
  featured_image_url TEXT,
  researcher_name TEXT NOT NULL,
  research_content_url TEXT,
  external_link TEXT,
  more_information JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_is_active ON research(is_active);
CREATE INDEX IF NOT EXISTS idx_research_category ON research(category);
CREATE INDEX IF NOT EXISTS idx_research_created_at ON research(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_title ON research USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_research_description ON research USING gin(to_tsvector('english', description));

-- Site Members Table (About/Team)
CREATE TABLE IF NOT EXISTS public.site_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  role TEXT,
  bio TEXT,
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_members_group ON site_members(group_key);
CREATE INDEX IF NOT EXISTS idx_site_members_is_active ON site_members(is_active);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Notification Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target TEXT NOT NULL,
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

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Note: Run these in Supabase SQL Editor or via Supabase Dashboard

-- Profile Pictures Bucket
-- SELECT storage.create_bucket('profile_pictures', jsonb_build_object('public', true));

-- Events Bucket
-- SELECT storage.create_bucket('events', jsonb_build_object('public', true));

-- Gallery Bucket
-- SELECT storage.create_bucket('gallery', jsonb_build_object('public', true));

-- Research Bucket
-- SELECT storage.create_bucket('research', jsonb_build_object('public', true));

-- Committee Member Profile Bucket
-- SELECT storage.create_bucket('committee_member_profile', jsonb_build_object('public', true));

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert Default Subscription Plans
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

-- =====================================================
-- END OF SCHEMA
-- =====================================================

