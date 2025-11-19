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
      <Card className="p-4 hover:bg-card/80 transition-colors cursor-pointer border-border">
        <div className="space-y-3">
          {/* League and status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{league}</span>
            {isLive && (
              <Badge variant="default" className="bg-live text-white">
                <Circle className="w-2 h-2 mr-1 fill-white animate-pulse" />
                LIVE
              </Badge>
            )}
            {isFinished && (
              <Badge variant="secondary" className="text-muted-foreground">
                FT
              </Badge>
            )}
            {isUpcoming && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(matchDate), "HH:mm")}
              </span>
            )}
          </div>

          {/* Teams and scores */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                  {homeTeam.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-foreground">{homeTeam}</span>
              </div>
              {(isLive || isFinished) && (
                <span className="text-2xl font-bold text-foreground">{homeScore}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
                  {awayTeam.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-foreground">{awayTeam}</span>
              </div>
              {(isLive || isFinished) && (
                <span className="text-2xl font-bold text-foreground">{awayScore}</span>
              )}
            </div>
          </div>

          {/* Venue */}
          {venue && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              {venue}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default MatchCard;
