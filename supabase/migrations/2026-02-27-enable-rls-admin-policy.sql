-- Enable RLS on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own profile, but NOT the is_admin flag
CREATE POLICY "Users can update their own profile except is_admin"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (is_admin IS NULL OR is_admin = OLD.is_admin)
  );

-- Allow only service role (admin) to update is_admin
CREATE POLICY "Service role can update is_admin"
  ON profiles
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (true);
