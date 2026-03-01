-- 1. Drop the triggers that depend on the old function
DROP TRIGGER IF EXISTS trg_set_membership_code ON users;
DROP TRIGGER IF EXISTS ensure_membership_code ON users;

-- 2. Drop the old function itself
DROP FUNCTION IF EXISTS set_membership_code();

-- 3. Run the new trigger function
CREATE OR REPLACE FUNCTION public.set_membership_code_trigger()
RETURNS TRIGGER AS $ $
BEGIN
  IF NEW.membership_type = 'paid' AND NEW.membership_code IS NULL THEN
    NEW.membership_code := public.generate_membership_code();
  END IF;
  
  RETURN NEW;
END;
$ $ LANGUAGE plpgsql;

-- 4. Re-attach the trigger using the new function name
CREATE TRIGGER trg_set_membership_code
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION public.set_membership_code_trigger();

-- 5. And the generation function to be safe
CREATE OR REPLACE FUNCTION public.generate_membership_code()
RETURNS text AS $ $
DECLARE
  next_number int;
BEGIN
  UPDATE public.membership_sequences
  SET last_number = last_number + 1
  WHERE year = 0
  RETURNING last_number INTO next_number;

  IF NOT FOUND THEN
    INSERT INTO public.membership_sequences (year, last_number)
    VALUES (0, 1)
    RETURNING last_number INTO next_number;
  END IF;

  RETURN 'BDS-' || next_number::text;
END;
$ $ LANGUAGE plpgsql;

