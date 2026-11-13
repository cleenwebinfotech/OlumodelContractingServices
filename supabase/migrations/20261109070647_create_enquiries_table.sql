/*
# Create enquiries table for Olumodel Contracting Services

1. Purpose
   Stores customer enquiries submitted through the "Get a Quote" and "Contact Us" forms.
   This is a no-auth, single-tenant public site — anyone can submit an enquiry, and
   the business owner reviews submissions directly in the database.

2. New Tables
   - `enquiries`
     - `id` (uuid, primary key, auto-generated)
     - `name` (text, not null) — customer's full name
     - `email` (text, not null) — customer's email address
     - `phone` (text, customer's phone number, optional)
     - `service` (text, the service the customer is interested in)
     - `message` (text, the enquiry details / project description)
     - `source` (text, which form submitted this — 'quote' or 'contact')
     - `created_at` (timestamptz, defaults to now)

3. Security
   - Enable RLS on `enquiries`.
   - Grant INSERT to `anon, authenticated` so the public website can submit enquiries
     without signing in. Grant SELECT to `authenticated` only — the business owner
     (authenticated) can review enquiries, but anonymous visitors cannot read other
     people's submissions.
   - INSERT policy allows anyone (anon + authenticated) to create new enquiry rows.
     SELECT is restricted to authenticated users only to protect customer privacy.

4. Notes
   - No user_id / auth dependency — this is a public enquiry form.
   - The site frontend uses the anon key, so INSERT must be allowed for `anon`.
*/

CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text NOT NULL,
  source text NOT NULL DEFAULT 'contact',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) to submit enquiries, authenticated users to read them
GRANT INSERT ON enquiries TO anon, authenticated;
GRANT SELECT ON enquiries TO authenticated;

DROP POLICY IF EXISTS "anyone_can_submit_enquiry" ON enquiries;
CREATE POLICY "anyone_can_submit_enquiry"
  ON enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_can_read_enquiries" ON enquiries;
CREATE POLICY "authenticated_can_read_enquiries"
  ON enquiries FOR SELECT
  TO authenticated
  USING (true);
