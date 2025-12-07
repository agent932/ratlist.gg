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
  (5, 'toxicity', 'Toxicity'),
  (6, 'clutch-save', 'Clutch Save')
ON CONFLICT (id) DO NOTHING;
