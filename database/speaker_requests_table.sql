-- Speaker Requests Table
-- Stores speaker applications for events

CREATE TABLE IF NOT EXISTS public.speaker_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Personal Information (required)
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country_code TEXT DEFAULT '+973',
  affiliation_institution TEXT NOT NULL,
  country_of_practice TEXT NOT NULL,
  
  -- Professional Title / Position (enumerated)
  professional_title TEXT NOT NULL CHECK (
    professional_title IN (
      'Dental Consultant',
      'Dental Specialist',
      'Dental Resident',
      'General Dentist',
      'Dental Student'
    )
  ),
  
  -- Category (enumerated)
  category TEXT NOT NULL CHECK (
    category IN (
      'VIP',
      'Delegate',
      'Speaker',
      'Organizer',
      'Participant',
      'Exhibitor'
    )
  ),
  
  -- Presentation Topics (checkboxes) and files
  presentation_topics TEXT[] NOT NULL DEFAULT '{}',
  presentation_topic_other TEXT,
  abstract_form_url TEXT,
  article_presentation_url TEXT,
  
  -- Consent for Publication (radio)
  consent_for_publication BOOLEAN NOT NULL DEFAULT false,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed')) DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Badge
  badge_generated BOOLEAN DEFAULT FALSE,
  badge_url TEXT,
  badge_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, email)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_speaker_requests_event_id ON speaker_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_speaker_requests_user_id ON speaker_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_speaker_requests_email ON speaker_requests(email);
CREATE INDEX IF NOT EXISTS idx_speaker_requests_status ON speaker_requests(status);
CREATE INDEX IF NOT EXISTS idx_speaker_requests_created_at ON speaker_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speaker_requests_approved_by ON speaker_requests(approved_by);
