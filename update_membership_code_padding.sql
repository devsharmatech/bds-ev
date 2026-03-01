CREATE OR REPLACE FUNCTION generate_membership_code()
RETURNS text AS $ $
DECLARE
  next_id integer;
  max_code text;
BEGIN
  -- Get the code with the highest numeric suffix that matches our pattern BDS-[number]
  SELECT membership_code INTO max_code
  FROM users
  WHERE membership_code ~ '^BDS-[0-9]+$'
  ORDER BY NULLIF(regexp_replace(membership_code, '^BDS-', ''), '')::integer DESC
  LIMIT 1;

  IF max_code IS NULL THEN
    next_id := 1;
  ELSE
    next_id := (regexp_replace(max_code, '^BDS-', ''))::integer + 1;
  END IF;

  RETURN 'BDS-' || next_id::text;
END;
$ $ LANGUAGE plpgsql;
