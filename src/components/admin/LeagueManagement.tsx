import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface League {
  id: string;
  name: string;
  country: string;
  season: string;
  logo: string | null;
}

const LeagueManagement = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [open, setOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    season: "2024-25",
    logo: "",
  });

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    const { data } = await supabase.from("leagues").select("*").order("name");
    setLeagues(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLeague) {
        const { error } = await supabase
          .from("leagues")
          .update(formData)
          .eq("id", editingLeague.id);
        
        if (error) throw error;
        toast.success("League updated successfully");
      } else {
        const { error } = await supabase.from("leagues").insert([formData]);
        if (error) throw error;
        toast.success("League added successfully");
      }
      
      setOpen(false);
      setEditingLeague(null);
      setFormData({ name: "", country: "", season: "2024-25", logo: "" });
      fetchLeagues();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this league?")) return;
    
    try {
      const { error } = await supabase.from("leagues").delete().eq("id", id);
      if (error) throw error;
      toast.success("League deleted successfully");
      fetchLeagues();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (league: League) => {
    setEditingLeague(league);
    setFormData({
      name: league.name,
      country: league.country,
      season: league.season,
      logo: league.logo || "",
    });
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Leagues</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingLeague(null);
              setFormData({ name: "", country: "", season: "2024-25", logo: "" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add League
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLeague ? "Edit League" : "Add New League"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">League Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="season">Season</Label>
                <Input
                  id="season"
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  required
                />
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
              <Button type="submit" className="w-full">
                {editingLeague ? "Update League" : "Add League"}
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
              <TableHead>Country</TableHead>
              <TableHead>Season</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagues.map((league) => (
              <TableRow key={league.id}>
                <TableCell>
                  {league.logo ? (
                    <img src={league.logo} alt={league.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs">
                      {league.name.substring(0, 2)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-semibold">{league.name}</TableCell>
                <TableCell>{league.country}</TableCell>
                <TableCell>{league.season}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(league)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(league.id)}>
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

export default LeagueManagement;
