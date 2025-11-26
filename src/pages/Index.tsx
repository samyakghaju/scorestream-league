import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .order("match_date", { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const finishedMatches = matches.filter((m) => m.status === "finished");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-primary py-20 px-4 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-overlay"></div>
        <div className="container mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            LIVE MATCHES
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium">
            Experience the thrill of football
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 pb-12">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar />
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card border-2 border-border mb-8 p-1 h-14 rounded-2xl">
                <TabsTrigger value="all" className="text-base font-bold rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-white">All</TabsTrigger>
                <TabsTrigger value="live" className="text-base font-bold rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-white">Live</TabsTrigger>
                <TabsTrigger value="upcoming" className="text-base font-bold rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-white">Upcoming</TabsTrigger>
                <TabsTrigger value="finished" className="text-base font-bold rounded-xl data-[state=active]:bg-gradient-primary data-[state=active]:text-white">Finished</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading matches...</p>
                ) : matches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No matches available</p>
                ) : (
                  <div className="grid gap-4">
                    {matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        id={match.id}
                        homeTeam={match.home_team?.name || "TBD"}
                        awayTeam={match.away_team?.name || "TBD"}
                        homeScore={match.home_score ?? undefined}
                        awayScore={match.away_score ?? undefined}
                        status={match.status}
                        matchDate={match.match_date}
                        venue={match.venue ?? undefined}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="live" className="space-y-4">
                {liveMatches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No live matches</p>
                ) : (
                  <div className="grid gap-4">
                    {liveMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        id={match.id}
                        homeTeam={match.home_team?.name || "TBD"}
                        awayTeam={match.away_team?.name || "TBD"}
                        homeScore={match.home_score ?? undefined}
                        awayScore={match.away_score ?? undefined}
                        status={match.status}
                        matchDate={match.match_date}
                        venue={match.venue ?? undefined}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingMatches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No upcoming matches</p>
                ) : (
                  <div className="grid gap-4">
                    {upcomingMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        id={match.id}
                        homeTeam={match.home_team?.name || "TBD"}
                        awayTeam={match.away_team?.name || "TBD"}
                        status={match.status}
                        matchDate={match.match_date}
                        venue={match.venue ?? undefined}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="finished" className="space-y-4">
                {finishedMatches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No finished matches</p>
                ) : (
                  <div className="grid gap-4">
                    {finishedMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        id={match.id}
                        homeTeam={match.home_team?.name || "TBD"}
                        awayTeam={match.away_team?.name || "TBD"}
                        homeScore={match.home_score ?? undefined}
                        awayScore={match.away_score ?? undefined}
                        status={match.status}
                        matchDate={match.match_date}
                        venue={match.venue ?? undefined}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
