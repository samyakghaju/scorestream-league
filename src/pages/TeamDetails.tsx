import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Team {
  id: string;
  name: string;
  logo: string | null;
  stadium: string | null;
  founded: number | null;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  goals: number;
  assists: number;
  rating: number;
  appearances: number;
}

interface Manager {
  id: string;
  name: string;
  photo_url: string | null;
  nationality: string | null;
  age: number | null;
  wins: number;
  draws: number;
  losses: number;
  win_percentage: number;
}

interface Match {
  id: string;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team: { id: string; name: string; logo: string | null };
  away_team: { id: string; name: string; logo: string | null };
  venue: string | null;
}

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [manager, setManager] = useState<Manager | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    if (!id) return;

    setLoading(true);

    // Fetch team data
    const { data: teamData } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    // Fetch players
    const { data: playersData } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", id)
      .order("jersey_number", { ascending: true });

    // Fetch manager
    const { data: managerData } = await supabase
      .from("managers")
      .select("*")
      .eq("team_id", id)
      .maybeSingle();

    // Fetch recent matches
    const { data: matchesData } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        status,
        home_score,
        away_score,
        venue,
        home_team:teams!matches_home_team_id_fkey(id, name, logo),
        away_team:teams!matches_away_team_id_fkey(id, name, logo)
      `)
      .or(`home_team_id.eq.${id},away_team_id.eq.${id}`)
      .order("match_date", { ascending: false })
      .limit(5);

    setTeam(teamData);
    setPlayers(playersData || []);
    setManager(managerData);
    setRecentMatches(matchesData || []);
    setLoading(false);
  };

  const getMatchResult = (match: Match) => {
    if (!match.home_score && match.home_score !== 0) return null;
    
    const isHome = match.home_team.id === id;
    const teamScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;

    if (teamScore > opponentScore) return "W";
    if (teamScore < opponentScore) return "L";
    return "D";
  };

  const getResultBadgeVariant = (result: string | null) => {
    if (result === "W") return "default";
    if (result === "L") return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Team not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Team Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              {team.logo && (
                <img src={team.logo} alt={team.name} className="w-24 h-24 object-contain" />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground">{team.name}</h1>
                <div className="flex gap-4 mt-2 text-muted-foreground">
                  {team.stadium && <span>🏟️ {team.stadium}</span>}
                  {team.founded && <span>📅 Founded {team.founded}</span>}
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{team.points}</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{team.wins}</div>
                    <div className="text-xs text-muted-foreground">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{team.draws}</div>
                    <div className="text-xs text-muted-foreground">Draws</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{team.losses}</div>
                    <div className="text-xs text-muted-foreground">Losses</div>
                  </div>
                </div>
              </div>
              {/* Form */}
              <div className="flex gap-2">
                {recentMatches.slice(0, 5).map((match) => {
                  const result = getMatchResult(match);
                  return result ? (
                    <Badge key={match.id} variant={getResultBadgeVariant(result)}>
                      {result}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manager Section */}
        {manager && (
          <Card>
            <CardHeader>
              <CardTitle>Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={manager.photo_url || ""} alt={manager.name} />
                  <AvatarFallback>{manager.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{manager.name}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                    {manager.nationality && <span>🌍 {manager.nationality}</span>}
                    {manager.age && <span>👤 {manager.age} years</span>}
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-foreground">{manager.win_percentage}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{manager.wins}</div>
                    <div className="text-xs text-muted-foreground">Wins</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Squad Section */}
        <Card>
          <CardHeader>
            <CardTitle>Squad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players.length === 0 ? (
                <p className="text-muted-foreground">No players found</p>
              ) : (
                players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center font-bold text-muted-foreground">
                        {player.jersey_number || "-"}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.position}</div>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-foreground">{player.goals}</div>
                        <div className="text-xs text-muted-foreground">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-foreground">{player.assists}</div>
                        <div className="text-xs text-muted-foreground">Assists</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-foreground">{player.rating?.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-foreground">{player.appearances}</div>
                        <div className="text-xs text-muted-foreground">Apps</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches.length === 0 ? (
                <p className="text-muted-foreground">No matches found</p>
              ) : (
                recentMatches.map((match) => {
                  const result = getMatchResult(match);
                  return (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 flex-1">
                          {match.home_team.logo && (
                            <img src={match.home_team.logo} alt="" className="w-8 h-8 object-contain" />
                          )}
                          <span className="font-semibold text-foreground">{match.home_team.name}</span>
                        </div>
                        <div className="text-center">
                          {match.status === "completed" ? (
                            <div className="text-lg font-bold text-foreground">
                              {match.home_score} - {match.away_score}
                            </div>
                          ) : (
                            <Badge variant="outline">{match.status}</Badge>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(match.match_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-semibold text-foreground">{match.away_team.name}</span>
                          {match.away_team.logo && (
                            <img src={match.away_team.logo} alt="" className="w-8 h-8 object-contain" />
                          )}
                        </div>
                      </div>
                      {result && (
                        <Badge variant={getResultBadgeVariant(result)} className="ml-4">
                          {result}
                        </Badge>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamDetails;
