-- Add PlayStation Network and Xbox Live as supported platforms
-- Migration: 0017_add_platform_games.sql

-- Insert PSN and Xbox as games/platforms
INSERT INTO public.games (slug, name) VALUES
  ('psn', 'PlayStation Network'),
  ('xbox', 'Xbox Live')
ON CONFLICT (slug) DO NOTHING;

-- Note: Players can now link their PSN IDs and Xbox Gamertags
-- This allows cross-platform incident reporting and reputation tracking
