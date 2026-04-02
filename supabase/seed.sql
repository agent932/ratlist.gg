-- Seed data for local development
-- Insert test games
INSERT INTO public.games (slug, name) VALUES
  ('arc-raiders', 'ARC Raiders'),
  ('dark-and-darker', 'Dark and Darker')
ON CONFLICT (slug) DO NOTHING;

-- Insert incident categories
INSERT INTO public.incident_categories (id, slug, label) VALUES
  (1, 'betrayal', 'Betrayal'),
  (2, 'extract-camping', 'Extract Camping'),
  (3, 'stream-sniping', 'Stream Sniping'),
  (4, 'team-violation', 'Team Violation'),
  (5, 'cheating', 'Cheating'),
  (6, 'scamming', 'Scamming'),
  (7, 'toxicity', 'Toxicity'),
  (8, 'griefing', 'Griefing'),
  (9, 'teaming', 'Teaming'),
  (10, 'friendly-fire', 'Friendly Fire'),
  (11, 'clutch-save', 'Clutch Save'),
  (12, 'helpful', 'Helpful')
ON CONFLICT (id) DO NOTHING;
