import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface Match {
  id: string;
  home_team: {
    name: string;
  };
  away_team: {
    name: string;
  };
  match_date: string;
  venue: string;
}

const UpcomingMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          match_date,
          venue,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .eq("status", "upcoming")
        .gte("match_date", new Date().toISOString())
        .order("match_date", { ascending: true })
        .limit(5);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error("Error fetching upcoming matches:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent" />
          Upcoming Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No upcoming matches scheduled
          </p>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex-1 text-right">
                <p className="font-semibold">{match.home_team?.name}</p>
              </div>
              <div className="px-6">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(match.match_date), "MMM dd, HH:mm")}
                </p>
                <p className="text-lg font-bold text-primary">VS</p>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{match.away_team?.name}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMatches;
