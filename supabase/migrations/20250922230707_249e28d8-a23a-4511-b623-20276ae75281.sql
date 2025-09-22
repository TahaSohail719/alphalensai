-- Clean up duplicate sessions with the problematic session_id
-- Keep only the most recent session for each user and deactivate the rest
UPDATE user_sessions 
SET is_active = false 
WHERE session_id = 'eyJhbGciOiJIUzI1NiIs' 
AND id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM user_sessions 
  WHERE session_id = 'eyJhbGciOiJIUzI1NiIs'
  ORDER BY user_id, created_at DESC
);