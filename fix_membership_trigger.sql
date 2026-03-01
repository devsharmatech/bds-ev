-- This script correctly creates BOTH required functions.
-- Please run this ENTIRE block in the SQL Editor.

-- 1. The function that generates the next 'BDS-X' code
CREATE OR REPLACE FUNCTION public.generate_membership_code()
RETURNS text AS $ $
DECLARE
  next_number int;
BEGIN
  -- We use year = 0 as a "Global" key to keep the sequence unique
  UPDATE public.membership_sequences
  SET last_number = last_number + 1
  WHERE year = 0
  RETURNING last_number INTO next_number;

  -- If it's the first ever code, create the global sequence row
  IF NOT FOUND THEN
    INSERT INTO public.membership_sequences (year, last_number)
    VALUES (0, 1)
    RETURNING last_number INTO next_number;
  END IF;

  -- Returns only the BDS prefix and the straightforward number
  RETURN 'BDS-' || next_number::text;
END;
$ $ LANGUAGE plpgsql;

-- 2. The database trigger that automatically assigns the code
CREATE OR REPLACE FUNCTION public.set_membership_code_trigger()
RETURNS TRIGGER AS $ $
BEGIN
  -- Only call generate_membership_code if membership_type is 'paid'
  -- and they don't already have a code.
  IF NEW.membership_type = 'paid' AND NEW.membership_code IS NULL THEN
    NEW.membership_code := public.generate_membership_code();
  END IF;
  
  RETURN NEW;
END;
$ $ LANGUAGE plpgsql;

