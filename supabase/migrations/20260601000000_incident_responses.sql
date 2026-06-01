-- Incident responses: allows the reported player (owner of the player_link) to respond to an incident

CREATE TABLE IF NOT EXISTS public.incident_responses (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        text NOT NULL CHECK (char_length(body) >= 10 AND char_length(body) <= 500),
  created_at  timestamptz DEFAULT now() NOT NULL,
  UNIQUE (incident_id)  -- one response per incident
);

ALTER TABLE public.incident_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can read responses
CREATE POLICY "responses_public_read"
  ON public.incident_responses FOR SELECT
  USING (true);

-- Only the response owner can insert (API enforces player_link ownership check)
CREATE POLICY "responses_insert_own"
  ON public.incident_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owner can update their own response
CREATE POLICY "responses_update_own"
  ON public.incident_responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
