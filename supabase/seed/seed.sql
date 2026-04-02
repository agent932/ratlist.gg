insert into public.games (slug, name) values
  ('tarkov', 'Escape from Tarkov') on conflict do nothing,
  ('dark-and-darker', 'Dark and Darker') on conflict do nothing,
  ('psn', 'PlayStation Network') on conflict do nothing,
  ('xbox', 'Xbox Live') on conflict do nothing;

insert into public.incident_categories (id, slug, label) values
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
  on conflict do nothing;
