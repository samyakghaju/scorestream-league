import Navbar from "@/components/Navbar";
import LeagueTable from "@/components/LeagueTable";
import TopScorers from "@/components/TopScorers";
import TopAssists from "@/components/TopAssists";
import UpcomingMatches from "@/components/UpcomingMatches";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Football League</h1>
          <p className="text-muted-foreground">Live standings, stats, and upcoming matches</p>
        </div>
        
        <div className="grid gap-6">
          <LeagueTable />
          
          <div className="grid md:grid-cols-2 gap-6">
            <TopScorers />
            <TopAssists />
          </div>
          
          <UpcomingMatches />
        </div>
      </div>
    </div>
  );
};

export default Index;
