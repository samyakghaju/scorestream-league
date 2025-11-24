import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  logo: string | null;
  league_id: string | null;
}

interface League {
  id: string;
  name: string;
  country: string;
  season: string;
}

const Standings = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchTeams();
    }
  }, [selectedLeague]);

  const fetchLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .order("name");

      if (error) throw error;
      setLeagues(data || []);
      if (data && data.length > 0) {
        setSelectedLeague(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching leagues:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("league_id", selectedLeague)
        .order("points", { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const currentLeague = leagues.find(l => l.id === selectedLeague);

  const getFormIcon = (index: number) => {
    if (index === 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (index >= teams.length - 3) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">League Standings</h1>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Select value={selectedLeague} onValueChange={setSelectedLeague}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select league" />
              </SelectTrigger>
              <SelectContent>
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id}>
                    {league.name} ({league.season})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentLeague && (
              <p className="text-muted-foreground">
                {currentLeague.country} - {currentLeague.season}
              </p>
            )}
          </div>
        </div>

        <Card className="overflow-hidden border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-12 text-foreground">Pos</TableHead>
                <TableHead className="text-foreground">Team</TableHead>
                <TableHead className="text-center text-foreground">P</TableHead>
                <TableHead className="text-center text-foreground">W</TableHead>
                <TableHead className="text-center text-foreground">D</TableHead>
                <TableHead className="text-center text-foreground">L</TableHead>
                <TableHead className="text-center text-foreground">GF</TableHead>
                <TableHead className="text-center text-foreground">GA</TableHead>
                <TableHead className="text-center text-foreground">GD</TableHead>
                <TableHead className="text-center text-foreground">Form</TableHead>
                <TableHead className="text-center font-bold text-foreground">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={team.id} className="hover:bg-muted/50 border-border">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {index + 1}
                      {getFormIcon(index)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-foreground">{team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {team.wins + team.draws + team.losses}
                  </TableCell>
                  <TableCell className="text-center text-foreground">{team.wins}</TableCell>
                  <TableCell className="text-center text-foreground">{team.draws}</TableCell>
                  <TableCell className="text-center text-foreground">{team.losses}</TableCell>
                  <TableCell className="text-center text-foreground">{team.goals_for}</TableCell>
                  <TableCell className="text-center text-foreground">{team.goals_against}</TableCell>
                  <TableCell className="text-center text-foreground">
                    {team.goals_for - team.goals_against > 0 ? "+" : ""}
                    {team.goals_for - team.goals_against}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      {["W", "W", "D", "L", "W"].map((result, i) => (
                        <div
                          key={i}
                          className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold ${
                            result === "W"
                              ? "bg-success text-white"
                              : result === "D"
                              ? "bg-muted text-foreground"
                              : "bg-destructive text-white"
                          }`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-accent">
                    {team.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Standings;
