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

interface Team {
  id: string;
  name: string;
  stadium: string;
  founded: number;
  logo: string | null;
  league_id: string | null;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

interface League {
  id: string;
  name: string;
}

const TeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    stadium: "",
    founded: new Date().getFullYear(),
    logo: "",
    league_id: "",
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    points: 0,
  });

  useEffect(() => {
    fetchTeams();
    fetchLeagues();
  }, []);

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("*").order("name");
    setTeams(data || []);
  };

  const fetchLeagues = async () => {
    const { data } = await supabase.from("leagues").select("id, name").order("name");
    setLeagues(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTeam) {
        const { error } = await supabase
          .from("teams")
          .update(formData)
          .eq("id", editingTeam.id);
        
        if (error) throw error;
        toast.success("Team updated successfully");
      } else {
        const { error } = await supabase.from("teams").insert([formData]);
        if (error) throw error;
        toast.success("Team added successfully");
      }
      
      setOpen(false);
      setEditingTeam(null);
      setFormData({ 
        name: "", 
        stadium: "", 
        founded: new Date().getFullYear(), 
        logo: "", 
        league_id: "",
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        points: 0,
      });
      fetchTeams();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    
    try {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw error;
      toast.success("Team deleted successfully");
      fetchTeams();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      stadium: team.stadium,
      founded: team.founded,
      logo: team.logo || "",
      league_id: team.league_id || "",
      wins: team.wins,
      draws: team.draws,
      losses: team.losses,
      goals_for: team.goals_for,
      goals_against: team.goals_against,
      points: team.points,
    });
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Teams</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTeam(null);
              setFormData({ 
                name: "", 
                stadium: "", 
                founded: new Date().getFullYear(), 
                logo: "", 
                league_id: "",
                wins: 0,
                draws: 0,
                losses: 0,
                goals_for: 0,
                goals_against: 0,
                points: 0,
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
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
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="stadium">Stadium</Label>
                <Input
                  id="stadium"
                  value={formData.stadium}
                  onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="founded">Founded Year</Label>
                <Input
                  id="founded"
                  type="number"
                  value={formData.founded}
                  onChange={(e) => setFormData({ ...formData, founded: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">League Stats (Manual Edit)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="wins">Wins</Label>
                    <Input
                      id="wins"
                      type="number"
                      value={formData.wins}
                      onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="draws">Draws</Label>
                    <Input
                      id="draws"
                      type="number"
                      value={formData.draws}
                      onChange={(e) => setFormData({ ...formData, draws: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="losses">Losses</Label>
                    <Input
                      id="losses"
                      type="number"
                      value={formData.losses}
                      onChange={(e) => setFormData({ ...formData, losses: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goals_for">Goals For</Label>
                    <Input
                      id="goals_for"
                      type="number"
                      value={formData.goals_for}
                      onChange={(e) => setFormData({ ...formData, goals_for: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="goals_against">Goals Against</Label>
                    <Input
                      id="goals_against"
                      type="number"
                      value={formData.goals_against}
                      onChange={(e) => setFormData({ ...formData, goals_against: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingTeam ? "Update Team" : "Add Team"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Stadium</TableHead>
              <TableHead className="text-center">Stats</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => {
              const league = leagues.find(l => l.id === team.league_id);
              return (
                <TableRow key={team.id}>
                  <TableCell>
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                        {team.name.substring(0, 2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{team.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{league?.name || "No League"}</TableCell>
                  <TableCell>{team.stadium}</TableCell>
                  <TableCell className="text-center text-xs">
                    <div className="space-y-1">
                      <div>W: {team.wins} D: {team.draws} L: {team.losses}</div>
                      <div>GF: {team.goals_for} GA: {team.goals_against}</div>
                      <div className="font-bold text-accent">Pts: {team.points}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(team)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(team.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TeamManagement;
