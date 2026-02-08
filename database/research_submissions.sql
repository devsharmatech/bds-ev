-- ===================================================================
-- research_submissions table
-- Stores public research submission requests (similar to speaker_requests)
-- Anyone can submit; admin approves/rejects before adding to research
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.research_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country_code TEXT DEFAULT '+973',
  affiliation_institution TEXT,
  country_of_practice TEXT DEFAULT 'Bahrain',
  professional_title TEXT,  -- e.g. Dental Consultant, Specialist, etc.

  -- Research Details
  research_title TEXT NOT NULL,
  research_category TEXT,
  description TEXT,
  presentation_topics TEXT[] DEFAULT '{}',
  presentation_topic_other TEXT,
  external_link TEXT,

  -- Files
  profile_image_url TEXT,
  abstract_url TEXT,         -- uploaded abstract PDF/DOC
  research_document_url TEXT, -- uploaded full research paper PDF/DOC
  featured_image_url TEXT,    -- optional cover/featured image

  -- Bio
  bio TEXT,

  -- Consent
  consent_for_publication TEXT,

  -- Declaration
  declaration_data JSONB,

  -- Admin workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  admin_notes TEXT,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_submissions_status ON public.research_submissions(status);
CREATE INDEX IF NOT EXISTS idx_research_submissions_email ON public.research_submissions(email);
CREATE INDEX IF NOT EXISTS idx_research_submissions_created ON public.research_submissions(created_at DESC);

-- Unique constraint: one submission per email per research title
CREATE UNIQUE INDEX IF NOT EXISTS idx_research_submissions_unique
  ON public.research_submissions(email, research_title);

-- Enable RLS
ALTER TABLE public.research_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public inserts (for submission form)
CREATE POLICY "Allow public insert on research_submissions"
  ON public.research_submissions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated reads (for admin)
CREATE POLICY "Allow authenticated select on research_submissions"
  ON public.research_submissions
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated updates (for admin approve/reject)
CREATE POLICY "Allow authenticated update on research_submissions"
  ON public.research_submissions
  FOR UPDATE
  USING (true);

-- Policy: Allow authenticated deletes (for admin)
CREATE POLICY "Allow authenticated delete on research_submissions"
  ON public.research_submissions
  FOR DELETE
  USING (true);
