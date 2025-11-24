import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Shield, BarChart3, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-foreground">ScoreStream</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/standings")}
              className="flex items-center gap-2 text-foreground hover:text-accent"
            >
              <BarChart3 className="h-4 w-4" />
              Standings
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/managers")}
              className="flex items-center gap-2 text-foreground hover:text-accent"
            >
              <Award className="h-4 w-4" />
              Managers
            </Button>
            
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 text-foreground hover:text-accent"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}
            
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2 text-foreground hover:text-accent"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-foreground hover:text-accent"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
