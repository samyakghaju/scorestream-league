import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import { format } from "date-fns";

interface MatchCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  matchDate: string;
  venue?: string;
  league?: string;
}

const MatchCard = ({
  id,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  matchDate,
  venue,
  league = "Premier League",
}: MatchCardProps) => {
  const isLive = status === "live";
  const isFinished = status === "finished";
  const isUpcoming = status === "upcoming";

  return (
    <Link to={`/match/${id}`}>
      <Card className="group relative overflow-hidden p-6 hover:shadow-glow transition-all duration-300 cursor-pointer border-2 border-border hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        
        <div className="relative space-y-4">
          {/* League and status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{league}</span>
            {isLive && (
              <Badge className="bg-live text-white font-bold px-3 py-1 shadow-lg animate-pulse">
                <Circle className="w-2 h-2 mr-1 fill-white" />
                LIVE
              </Badge>
            )}
            {isFinished && (
              <Badge variant="secondary" className="font-bold px-3 py-1">
                FT
              </Badge>
            )}
            {isUpcoming && (
              <span className="text-sm font-bold text-muted-foreground">
                {format(new Date(matchDate), "HH:mm")}
              </span>
            )}
          </div>

          {/* Teams and scores */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                  {homeTeam.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{homeTeam}</span>
              </div>
              {(isLive || isFinished) && (
                <span className="text-4xl font-black text-foreground">{homeScore}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                  {awayTeam.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{awayTeam}</span>
              </div>
              {(isLive || isFinished) && (
                <span className="text-4xl font-black text-foreground">{awayScore}</span>
              )}
            </div>
          </div>

          {/* Venue */}
          {venue && (
            <div className="text-xs font-medium text-muted-foreground pt-3 border-t border-border/50">
              📍 {venue}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default MatchCard;
