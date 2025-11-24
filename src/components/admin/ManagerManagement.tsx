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

const ManagerManagement = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    photo_url: "",
    nationality: "",
    age: 40,
    team_id: "",
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    matches_managed: 0,
    win_percentage: 0,
  });

  useEffect(() => {
    fetchManagers();
    fetchTeams();
  }, []);

  const fetchManagers = async () => {
    const { data } = await supabase.from("managers").select("*").order("points", { ascending: false });
    setManagers(data || []);
  };

  const fetchTeams = async () => {
    const { data } = await supabase.from("teams").select("id, name").order("name");
    setTeams(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingManager) {
        const { error } = await supabase
          .from("managers")
          .update(formData)
          .eq("id", editingManager.id);
        
        if (error) throw error;
        toast.success("Manager updated successfully");
      } else {
        const { error } = await supabase.from("managers").insert([formData]);
        if (error) throw error;
        toast.success("Manager added successfully");
      }
      
      setOpen(false);
      setEditingManager(null);
      setFormData({
        name: "",
        photo_url: "",
        nationality: "",
        age: 40,
        team_id: "",
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        matches_managed: 0,
        win_percentage: 0,
      });
      fetchManagers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this manager?")) return;
    
    try {
      const { error } = await supabase.from("managers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Manager deleted successfully");
      fetchManagers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      photo_url: manager.photo_url || "",
      nationality: manager.nationality,
      age: manager.age,
      team_id: manager.team_id || "",
      wins: manager.wins,
      draws: manager.draws,
      losses: manager.losses,
      points: manager.points,
      matches_managed: manager.matches_managed,
      win_percentage: manager.win_percentage,
    });
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Managers</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingManager(null);
              setFormData({
                name: "",
                photo_url: "",
                nationality: "",
                age: 40,
                team_id: "",
                wins: 0,
                draws: 0,
                losses: 0,
                points: 0,
                matches_managed: 0,
                win_percentage: 0,
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manager
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingManager ? "Edit Manager" : "Add New Manager"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Manager Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="team">Team</Label>
                <Select value={formData.team_id} onValueChange={(value) => setFormData({ ...formData, team_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Statistics (Manual Edit)</h4>
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
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="matches_managed">Matches</Label>
                    <Input
                      id="matches_managed"
                      type="number"
                      value={formData.matches_managed}
                      onChange={(e) => setFormData({ ...formData, matches_managed: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="win_percentage">Win %</Label>
                    <Input
                      id="win_percentage"
                      type="number"
                      step="0.01"
                      value={formData.win_percentage}
                      onChange={(e) => setFormData({ ...formData, win_percentage: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingManager ? "Update Manager" : "Add Manager"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead className="text-center">Stats</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((manager) => {
              const team = teams.find(t => t.id === manager.team_id);
              return (
                <TableRow key={manager.id}>
                  <TableCell>
                    {manager.photo_url ? (
                      <img src={manager.photo_url} alt={manager.name} className="w-12 h-12 object-cover rounded-full" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-sm font-bold">
                        {manager.name.substring(0, 2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{manager.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{team?.name || "No Team"}</TableCell>
                  <TableCell>{manager.nationality}</TableCell>
                  <TableCell className="text-center text-xs">
                    <div className="space-y-1">
                      <div>W: {manager.wins} D: {manager.draws} L: {manager.losses}</div>
                      <div>Matches: {manager.matches_managed} | Win%: {manager.win_percentage}%</div>
                      <div className="font-bold text-accent">Pts: {manager.points}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(manager)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(manager.id)}>
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

export default ManagerManagement;
