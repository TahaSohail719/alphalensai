-- Enable realtime for the profiles table to ensure updates are broadcasted
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Set replica identity to full to capture all column changes
ALTER TABLE profiles REPLICA IDENTITY FULL;