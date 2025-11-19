import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Circle, Target, Activity } from "lucide-react";

interface Match {
  id: string;
  home_team: { name: string } | null;
  away_team: { name: string } | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
  match_date: string;
  venue: string | null;
}

const MatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchDetails();
  }, [id]);

  const fetchMatchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setMatch(data);
    } catch (error) {
      console.error("Error fetching match details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <p className="text-center text-muted-foreground">Match not found</p>
        </div>
      </div>
    );
  }

  const isLive = match.status === "live";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to matches
        </Link>

        {/* Match header */}
        <Card className="p-6 mb-6 border-border">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Premier League • Matchday 15</span>
              {isLive && (
                <Badge className="bg-live text-white">
                  <Circle className="w-2 h-2 mr-1 fill-white animate-pulse" />
                  LIVE
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-center gap-8">
              {/* Home team */}
              <div className="flex flex-col items-center gap-3 flex-1 max-w-[200px]">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {match.home_team?.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{match.home_team?.name}</h2>
              </div>

              {/* Score */}
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold text-foreground">{match.home_score ?? "-"}</span>
                <span className="text-2xl text-muted-foreground">:</span>
                <span className="text-5xl font-bold text-foreground">{match.away_score ?? "-"}</span>
              </div>

              {/* Away team */}
              <div className="flex flex-col items-center gap-3 flex-1 max-w-[200px]">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {match.away_team?.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{match.away_team?.name}</h2>
              </div>
            </div>

            {match.venue && (
              <p className="text-sm text-muted-foreground">{match.venue}</p>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="lineups">Lineups</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick stats */}
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Activity className="w-5 h-5 text-accent" />
                Match Statistics
              </h3>
              <div className="space-y-4">
                {/* Possession */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">45%</span>
                    <span className="text-muted-foreground">Possession</span>
                    <span className="text-foreground">55%</span>
                  </div>
                  <div className="flex gap-1">
                    <Progress value={45} className="flex-1" />
                    <Progress value={55} className="flex-1" />
                  </div>
                </div>

                {/* Shots */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">8</span>
                    <span className="text-muted-foreground">Shots</span>
                    <span className="text-foreground">12</span>
                  </div>
                  <div className="flex gap-1">
                    <Progress value={40} className="flex-1" />
                    <Progress value={60} className="flex-1" />
                  </div>
                </div>

                {/* Shots on target */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">4</span>
                    <span className="text-muted-foreground">Shots on Target</span>
                    <span className="text-foreground">6</span>
                  </div>
                  <div className="flex gap-1">
                    <Progress value={40} className="flex-1" />
                    <Progress value={60} className="flex-1" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Commentary */}
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-4 text-foreground">Live Commentary</h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Match commentary will appear here when available.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                <Target className="w-5 h-5 text-accent" />
                Advanced Statistics
              </h3>
              <p className="text-sm text-muted-foreground">
                Detailed match statistics will be displayed here.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="lineups">
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-4 text-foreground">Team Lineups</h3>
              <p className="text-sm text-muted-foreground">
                Team formations and player lineups will be displayed here.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="table">
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-4 text-foreground">League Table</h3>
              <p className="text-sm text-muted-foreground">
                League standings will be displayed here.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MatchDetails;
