import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Globe, Trophy } from "lucide-react";

const Sidebar = () => {
  const leagues = [
    { name: "Premier League", matches: 10 },
    { name: "La Liga", matches: 8 },
    { name: "Bundesliga", matches: 9 },
    { name: "Serie A", matches: 10 },
    { name: "Ligue 1", matches: 9 },
  ];

  const countries = [
    { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "Spain", flag: "🇪🇸" },
    { name: "Germany", flag: "🇩🇪" },
    { name: "Italy", flag: "🇮🇹" },
    { name: "France", flag: "🇫🇷" },
  ];

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
          {leagues.map((league) => (
            <button
              key={league.name}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <span className="text-sm text-foreground">{league.name}</span>
              <Badge variant="secondary" className="text-xs">
                {league.matches}
              </Badge>
            </button>
          ))}
        </div>
      </Card>

      {/* Countries */}
      <Card className="p-4 border-border">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-foreground">Countries</h3>
        </div>
        <div className="space-y-2">
          {countries.map((country) => (
            <button
              key={country.name}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <span className="text-lg">{country.flag}</span>
              <span className="text-sm text-foreground">{country.name}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;
