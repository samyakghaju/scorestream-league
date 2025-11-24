-- Create managers table
CREATE TABLE public.managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  nationality TEXT,
  age INTEGER,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  matches_managed INTEGER NOT NULL DEFAULT 0,
  win_percentage NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id)
);

-- Enable RLS
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

-- Create policies for managers
CREATE POLICY "Anyone can view managers" 
ON public.managers 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert managers" 
ON public.managers 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update managers" 
ON public.managers 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete managers" 
ON public.managers 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create trigger for managers updated_at
CREATE TRIGGER update_managers_updated_at
BEFORE UPDATE ON public.managers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update manager stats based on match result
CREATE OR REPLACE FUNCTION public.update_manager_standings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  home_manager_id UUID;
  away_manager_id UUID;
BEGIN
  -- Only update if match status is 'completed' and scores are set
  IF NEW.status = 'completed' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    
    -- Get manager IDs for both teams
    SELECT team_id INTO home_manager_id FROM managers WHERE team_id = NEW.home_team_id;
    SELECT team_id INTO away_manager_id FROM managers WHERE team_id = NEW.away_team_id;
    
    -- Update home manager stats
    IF home_manager_id IS NOT NULL THEN
      IF NEW.home_score > NEW.away_score THEN
        -- Home win
        UPDATE managers 
        SET wins = wins + 1, 
            points = points + 3,
            matches_managed = matches_managed + 1,
            win_percentage = ROUND(((wins + 1)::NUMERIC / (matches_managed + 1)::NUMERIC) * 100, 2)
        WHERE team_id = NEW.home_team_id;
      ELSIF NEW.home_score < NEW.away_score THEN
        -- Home loss
        UPDATE managers 
        SET losses = losses + 1,
            matches_managed = matches_managed + 1,
            win_percentage = ROUND((wins::NUMERIC / (matches_managed + 1)::NUMERIC) * 100, 2)
        WHERE team_id = NEW.home_team_id;
      ELSE
        -- Draw
        UPDATE managers 
        SET draws = draws + 1,
            points = points + 1,
            matches_managed = matches_managed + 1,
            win_percentage = ROUND((wins::NUMERIC / (matches_managed + 1)::NUMERIC) * 100, 2)
        WHERE team_id = NEW.home_team_id;
      END IF;
    END IF;
    
    -- Update away manager stats
    IF away_manager_id IS NOT NULL THEN
      IF NEW.away_score > NEW.home_score THEN
        -- Away win
        UPDATE managers 
        SET wins = wins + 1,
            points = points + 3,
            matches_managed = matches_managed + 1,
            win_percentage = ROUND(((wins + 1)::NUMERIC / (matches_managed + 1)::NUMERIC) * 100, 2)
        WHERE team_id = NEW.away_team_id;
      ELSIF NEW.away_score < NEW.home_score THEN
        -- Away loss
        UPDATE managers 
        SET losses = losses + 1,
            matches_managed = matches_managed + 1,
            win_percentage = ROUND((wins::NUMERIC / (matches_managed + 1)::NUMERIC) * 100, 2)
        WHERE team_id = NEW.away_team_id;
      ELSE
        -- Draw
        UPDATE managers 
        SET draws = draws + 1,
            points = points + 1,
            matches_managed = matches_managed + 1,
            win_percentage = ROUND((wins::NUMERIC / (matches_managed + 1)::NUMERIC) * 100, 2)
        WHERE team_id = NEW.away_team_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update manager standings when match is completed
CREATE TRIGGER auto_update_manager_standings
AFTER INSERT OR UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_manager_standings();

-- Enable realtime for managers
ALTER PUBLICATION supabase_realtime ADD TABLE public.managers;