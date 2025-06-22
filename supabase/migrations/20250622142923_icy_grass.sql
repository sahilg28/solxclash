-- Add predicted_price column to predictions table
DO $$
BEGIN
  -- Add predicted_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'predictions' AND column_name = 'predicted_price'
  ) THEN
    ALTER TABLE predictions ADD COLUMN predicted_price numeric(20, 8);
  END IF;
END $$;