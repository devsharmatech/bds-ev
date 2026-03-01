-- Sync membership sequence table with existing max user suffix

DO $ $
DECLARE
  max_num integer;
BEGIN
  -- Get the highest existing suffix from padded or unpadded BDS- codes
  SELECT COALESCE(MAX(NULLIF(regexp_replace(membership_code, '^BDS-0*', ''), '')::integer), 0) INTO max_num
  FROM users
  WHERE membership_code ~ '^BDS-[0-9]+$';

  -- Ensure the global sequence exists and is updated to that max
  IF EXISTS (SELECT 1 FROM membership_sequences WHERE year = 0) THEN
    UPDATE membership_sequences
    SET last_number = max_num
    WHERE year = 0;
  ELSE
    INSERT INTO membership_sequences (year, last_number)
    VALUES (0, max_num);
  END IF;

  RAISE NOTICE 'Membership sequence updated to %', max_num;
END $ $;
