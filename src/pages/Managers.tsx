import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Trophy } from "lucide-react";

interface Manager {
  id: string;
  name: string;
  photo_url: string | null;
  nationality: string;
  age: number;
  team_id: string | null;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  matches_managed: number;
  win_percentage: number;
}

interface Team {
  id: string;
  name: string;
}

const Managers = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('managers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'managers'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [managersResult, teamsResult] = await Promise.all([
        supabase.from("managers").select("*").order("points", { ascending: false }),
        supabase.from("teams").select("id, name")
      ]);

      setManagers(managersResult.data || []);
      setTeams(teamsResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">Manager Rankings</h1>
          </div>
          <p className="text-muted-foreground">Top performing managers by points and win percentage</p>
        </div>

        <Card className="overflow-hidden border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-12 text-foreground">Rank</TableHead>
                <TableHead className="text-foreground">Manager</TableHead>
                <TableHead className="text-foreground">Team</TableHead>
                <TableHead className="text-center text-foreground">Matches</TableHead>
                <TableHead className="text-center text-foreground">W</TableHead>
                <TableHead className="text-center text-foreground">D</TableHead>
                <TableHead className="text-center text-foreground">L</TableHead>
                <TableHead className="text-center text-foreground">Win %</TableHead>
                <TableHead className="text-center font-bold text-foreground">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager, index) => {
                const team = teams.find(t => t.id === manager.team_id);
                const isTopThree = index < 3;
                
                return (
                  <TableRow key={manager.id} className="hover:bg-muted/50 border-border">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {index + 1}
                        {isTopThree && <Trophy className={`w-4 h-4 ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          'text-amber-700'
                        }`} />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {manager.photo_url ? (
                          <img 
                            src={manager.photo_url} 
                            alt={manager.name} 
                            className="w-12 h-12 object-cover rounded-full border-2 border-border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-bold border-2 border-border">
                            {manager.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-foreground">{manager.name}</div>
                          <div className="text-xs text-muted-foreground">{manager.nationality} • {manager.age} yrs</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {team?.name || <span className="text-muted-foreground">No Team</span>}
                    </TableCell>
                    <TableCell className="text-center text-foreground">{manager.matches_managed}</TableCell>
                    <TableCell className="text-center text-foreground">{manager.wins}</TableCell>
                    <TableCell className="text-center text-foreground">{manager.draws}</TableCell>
                    <TableCell className="text-center text-foreground">{manager.losses}</TableCell>
                    <TableCell className="text-center font-semibold text-foreground">
                      {manager.win_percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center font-bold text-accent text-lg">
                      {manager.points}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {managers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No managers added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Managers;
