import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  match_date: string;
  status: string;
  venue: string;
  league_id: string | null;
  home_team: { name: string };
  away_team: { name: string };
}

interface Team {
  id: string;
  name: string;
}

interface League {
  id: string;
  name: string;
}

const MatchManagement = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [open, setOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    home_team_id: "",
    away_team_id: "",
    home_score: 0,
    away_score: 0,
    match_date: new Date().toISOString().slice(0, 16),
    status: "upcoming",
    venue: "",
    league_id: "",
  });

  useEffect(() => {
    fetchMatches();
    fetchTeams();
    fetchLeagues();
  }, []);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `)
      .order("match_date", { ascending: false });
    setMatches(data || []);
  };

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("id, name").order("name");
    setTeams(data || []);
  };

  const fetchLeagues = async () => {
    const { data } = await supabase.from("leagues").select("id, name").order("name");
    setLeagues(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.home_team_id === formData.away_team_id) {
      toast.error("Home and away teams must be different");
      return;
    }
    
    try {
      if (editingMatch) {
        const { error } = await supabase
          .from("matches")
          .update(formData)
          .eq("id", editingMatch.id);
        
        if (error) throw error;
        toast.success("Match updated successfully");
      } else {
        const { error } = await supabase.from("matches").insert([formData]);
        if (error) throw error;
        toast.success("Match added successfully");
      }
      
      setOpen(false);
      setEditingMatch(null);
      setFormData({
        home_team_id: "",
        away_team_id: "",
        home_score: 0,
        away_score: 0,
        match_date: new Date().toISOString().slice(0, 16),
        status: "upcoming",
        venue: "",
        league_id: "",
      });
      fetchMatches();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    
    try {
      const { error } = await supabase.from("matches").delete().eq("id", id);
      if (error) throw error;
      toast.success("Match deleted successfully");
      fetchMatches();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      home_score: match.home_score,
      away_score: match.away_score,
      match_date: new Date(match.match_date).toISOString().slice(0, 16),
      status: match.status,
      venue: match.venue,
      league_id: match.league_id || "",
    });
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Matches</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingMatch(null);
              setFormData({
                home_team_id: "",
                away_team_id: "",
                home_score: 0,
                away_score: 0,
                match_date: new Date().toISOString().slice(0, 16),
                status: "upcoming",
                venue: "",
                league_id: "",
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Match
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMatch ? "Edit Match" : "Add New Match"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="league">League</Label>
                <Select value={formData.league_id} onValueChange={(value) => setFormData({ ...formData, league_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select league" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.map((league) => (
                      <SelectItem key={league.id} value={league.id}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="home_team">Home Team</Label>
                <Select value={formData.home_team_id} onValueChange={(value) => setFormData({ ...formData, home_team_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select home team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="away_team">Away Team</Label>
                <Select value={formData.away_team_id} onValueChange={(value) => setFormData({ ...formData, away_team_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select away team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="home_score">Home Score</Label>
                  <Input
                    id="home_score"
                    type="number"
                    value={formData.home_score}
                    onChange={(e) => setFormData({ ...formData, home_score: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="away_score">Away Score</Label>
                  <Input
                    id="away_score"
                    type="number"
                    value={formData.away_score}
                    onChange={(e) => setFormData({ ...formData, away_score: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="match_date">Match Date</Label>
                <Input
                  id="match_date"
                  type="datetime-local"
                  value={formData.match_date}
                  onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingMatch ? "Update Match" : "Add Match"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Home Team</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead>Away Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{format(new Date(match.match_date), "MMM dd, yyyy HH:mm")}</TableCell>
                <TableCell className="font-semibold">{match.home_team?.name}</TableCell>
                <TableCell className="text-center font-bold">
                  {match.home_score} - {match.away_score}
                </TableCell>
                <TableCell className="font-semibold">{match.away_team?.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    match.status === 'upcoming' ? 'bg-muted text-muted-foreground' :
                    match.status === 'live' ? 'bg-accent text-accent-foreground' :
                    'bg-primary text-primary-foreground'
                  }`}>
                    {match.status}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(match)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(match.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MatchManagement;
