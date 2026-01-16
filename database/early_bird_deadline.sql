-- Migration: Add early_bird_deadline field to events table
-- This field determines when Early Bird pricing ends and Standard pricing begins

ALTER TABLE events ADD COLUMN IF NOT EXISTS early_bird_deadline TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN events.early_bird_deadline IS 'Deadline for Early Bird pricing. After this date, Standard pricing applies until event start. On event start date, On-site pricing applies.';

-- Pricing Logic:
-- 1. Before early_bird_deadline: Early Bird prices apply
-- 2. After early_bird_deadline but before start_datetime: Standard prices apply
-- 3. On or after start_datetime: On-site prices apply (for at-venue registration)
