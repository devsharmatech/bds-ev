-- Migration: Add new pricing fields to events table
-- This adds support for multiple pricing tiers based on member category and purchase timing
-- Categories: BDS Member, Non-Member (Regular), Student, Hygienist/Assistant/Technician
-- Tiers: Early Bird, Standard, On-site

-- Early Bird prices (existing regular_price and member_price remain for backward compatibility)
-- regular_price = Non-Member Early Bird price
-- member_price = BDS Member Early Bird price

-- Add Student Early Bird price
ALTER TABLE events ADD COLUMN IF NOT EXISTS student_price DECIMAL(10,3);
COMMENT ON COLUMN events.student_price IS 'Student Early Bird registration price';

-- Add Hygienist/Assistant/Technician Early Bird price
ALTER TABLE events ADD COLUMN IF NOT EXISTS hygienist_price DECIMAL(10,3);
COMMENT ON COLUMN events.hygienist_price IS 'Hygienist/Assistant/Technician Early Bird registration price';

-- Standard prices
ALTER TABLE events ADD COLUMN IF NOT EXISTS regular_standard_price DECIMAL(10,3);
COMMENT ON COLUMN events.regular_standard_price IS 'Non-Member Standard registration price';

ALTER TABLE events ADD COLUMN IF NOT EXISTS member_standard_price DECIMAL(10,3);
COMMENT ON COLUMN events.member_standard_price IS 'BDS Member Standard registration price';

ALTER TABLE events ADD COLUMN IF NOT EXISTS student_standard_price DECIMAL(10,3);
COMMENT ON COLUMN events.student_standard_price IS 'Student Standard registration price';

ALTER TABLE events ADD COLUMN IF NOT EXISTS hygienist_standard_price DECIMAL(10,3);
COMMENT ON COLUMN events.hygienist_standard_price IS 'Hygienist/Assistant/Technician Standard registration price';

-- On-site prices
ALTER TABLE events ADD COLUMN IF NOT EXISTS regular_onsite_price DECIMAL(10,3);
COMMENT ON COLUMN events.regular_onsite_price IS 'Non-Member On-site registration price';

ALTER TABLE events ADD COLUMN IF NOT EXISTS member_onsite_price DECIMAL(10,3);
COMMENT ON COLUMN events.member_onsite_price IS 'BDS Member On-site registration price';

ALTER TABLE events ADD COLUMN IF NOT EXISTS student_onsite_price DECIMAL(10,3);
COMMENT ON COLUMN events.student_onsite_price IS 'Student On-site registration price';

ALTER TABLE events ADD COLUMN IF NOT EXISTS hygienist_onsite_price DECIMAL(10,3);
COMMENT ON COLUMN events.hygienist_onsite_price IS 'Hygienist/Assistant/Technician On-site registration price';

-- Summary of all price fields:
-- | Category                           | Early Bird            | Standard                 | On-site                 |
-- |------------------------------------|----------------------|--------------------------|-------------------------|
-- | BDS Member                         | member_price         | member_standard_price    | member_onsite_price     |
-- | Non-Member (Regular)               | regular_price        | regular_standard_price   | regular_onsite_price    |
-- | Student                            | student_price        | student_standard_price   | student_onsite_price    |
-- | Hygienist/Assistant/Technician     | hygienist_price      | hygienist_standard_price | hygienist_onsite_price  |
