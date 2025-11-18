import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

interface Player {
  id: string;
  name: string;
  assists: number;
  team: {
    name: string;
  };
}

const TopAssists = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopAssists();
  }, []);

  const fetchTopAssists = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, assists, team:teams(name)")
        .gt("assists", 0)
        .order("assists", { ascending: false })
        .limit(10);

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error("Error fetching top assists:", error);
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
          <Users className="h-5 w-5 text-accent" />
          Top Assists
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Assists</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-semibold">{player.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {player.team?.name}
                </TableCell>
                <TableCell className="text-center font-bold text-accent">
                  {player.assists}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopAssists;
