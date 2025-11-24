-- Create leagues table
CREATE TABLE public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  season TEXT,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Create policies for leagues
CREATE POLICY "Anyone can view leagues" 
ON public.leagues 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert leagues" 
ON public.leagues 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update leagues" 
ON public.leagues 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete leagues" 
ON public.leagues 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add league_id to teams table
ALTER TABLE public.teams ADD COLUMN league_id UUID REFERENCES public.leagues(id);

-- Add league_id to matches table
ALTER TABLE public.matches ADD COLUMN league_id UUID REFERENCES public.leagues(id);

-- Create trigger for leagues updated_at
CREATE TRIGGER update_leagues_updated_at
BEFORE UPDATE ON public.leagues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update team standings based on match result
CREATE OR REPLACE FUNCTION public.update_team_standings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update if match status is 'completed' and scores are set
  IF NEW.status = 'completed' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    
    -- Update home team
    IF NEW.home_score > NEW.away_score THEN
      -- Home win
      UPDATE teams 
      SET wins = wins + 1, 
          points = points + 3,
          goals_for = goals_for + NEW.home_score,
          goals_against = goals_against + NEW.away_score
      WHERE id = NEW.home_team_id;
      
      -- Away loss
      UPDATE teams 
      SET losses = losses + 1,
          goals_for = goals_for + NEW.away_score,
          goals_against = goals_against + NEW.home_score
      WHERE id = NEW.away_team_id;
      
    ELSIF NEW.home_score < NEW.away_score THEN
      -- Away win
      UPDATE teams 
      SET wins = wins + 1,
          points = points + 3,
          goals_for = goals_for + NEW.away_score,
          goals_against = goals_against + NEW.home_score
      WHERE id = NEW.away_team_id;
      
      -- Home loss
      UPDATE teams 
      SET losses = losses + 1,
          goals_for = goals_for + NEW.home_score,
          goals_against = goals_against + NEW.away_score
      WHERE id = NEW.home_team_id;
      
    ELSE
      -- Draw
      UPDATE teams 
      SET draws = draws + 1,
          points = points + 1,
          goals_for = goals_for + NEW.home_score,
          goals_against = goals_against + NEW.away_score
      WHERE id = NEW.home_team_id;
      
      UPDATE teams 
      SET draws = draws + 1,
          points = points + 1,
          goals_for = goals_for + NEW.away_score,
          goals_against = goals_against + NEW.home_score
      WHERE id = NEW.away_team_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update standings when match is completed
CREATE TRIGGER auto_update_standings
AFTER INSERT OR UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_team_standings();

-- Insert the two leagues
INSERT INTO public.leagues (name, country, season) VALUES 
  ('Nepal Premier League', 'Nepal', '2024-25'),
  ('MIT League', 'USA', '2024-25');

-- Enable realtime for leagues and updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.leagues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;