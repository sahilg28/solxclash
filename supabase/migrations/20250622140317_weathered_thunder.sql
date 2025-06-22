/*
  # Add predicted_price column to predictions table

  1. Changes
    - Add `predicted_price` column to store the price at the moment of prediction
    - This enables comparing individual prediction prices with round end prices
    - Allows for more accurate win/loss determination

  2. Security
    - No RLS changes needed as existing policies cover the new column
*/

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