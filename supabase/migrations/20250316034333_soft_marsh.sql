/*
  # Create appraisals table

  1. New Tables
    - `appraisals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `technical_evaluation` (jsonb)
      - `economic_evaluation` (jsonb)
      - `legal_evaluation` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `appraisals` table
    - Add policy for authenticated users to read their own appraisals
    - Add policy for authenticated users to insert their own appraisals
*/

CREATE TABLE IF NOT EXISTS appraisals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  technical_evaluation jsonb NOT NULL,
  economic_evaluation jsonb NOT NULL,
  legal_evaluation jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own appraisals"
  ON appraisals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appraisals"
  ON appraisals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);