import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Trophy } from "lucide-react";

interface League {
  id: string;
  name: string;
  logo: string | null;
}

interface Team {
  id: string;
  name: string;
  logo: string | null;
}

const Sidebar = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetchLeagues();
    fetchTeams();
  }, []);

  const fetchLeagues = async () => {
    const { data } = await supabase
      .from("leagues")
      .select("id, name, logo")
      .order("name", { ascending: true });
    
    setLeagues(data || []);
  };

  const fetchTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("id, name, logo")
      .order("name", { ascending: true });
    
    setTeams(data || []);
  };

  return (
    <div className="space-y-4">
      {/* Favorites */}
      <Card className="p-4 border-border">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-foreground">Favorites</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Select your favorite teams to see them here
        </p>
      </Card>

      {/* Leagues */}
      <Card className="p-4 border-border">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-foreground">Leagues</h3>
        </div>
        <div className="space-y-2">
          {leagues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leagues available</p>
          ) : (
            leagues.map((league) => (
              <button
                key={league.id}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                {league.logo && (
                  <img src={league.logo} alt="" className="w-5 h-5 object-contain" />
                )}
                <span className="text-sm text-foreground">{league.name}</span>
              </button>
            ))
          )}
        </div>
      </Card>

      {/* Teams */}
      <Card className="p-4 border-border">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-foreground">Teams</h3>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">No teams available</p>
          ) : (
            teams.map((team) => (
              <Link
                key={team.id}
                to={`/team/${team.id}`}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {team.logo && (
                  <img src={team.logo} alt="" className="w-5 h-5 object-contain" />
                )}
                <span className="text-sm text-foreground hover:text-primary transition-colors">
                  {team.name}
                </span>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;
