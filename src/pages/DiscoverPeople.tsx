import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Search, Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  major: string;
  year: string;
  tags: string[];
  bio: string;
  looking_for: string[];
}

interface MatchedProfile extends Profile {
  matchScore: number;
  commonTags: string[];
}

const DiscoverPeople = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchedProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [userIntent, setUserIntent] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const loadMatches = async (intent: string) => {
    try {
      setIsSearching(true);
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("match-users", {
        body: { 
          userId: user.id,
          userIntent: intent
        },
      });

      if (error) throw error;

      if (data?.matches) {
        setMatches(data.matches);
        setHasSearched(true);
        if (data.matches.length === 0) {
          toast.info("No matches found. Try a different search prompt.");
        } else {
          toast.success(`Found ${data.matches.length} ${data.matches.length === 1 ? 'match' : 'matches'}!`);
        }
      } else {
        toast.error("No matches returned from server");
      }
    } catch (error) {
      console.error("Error loading matches:", error);
      toast.error(`Failed to load matches: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (!userIntent.trim()) {
      return;
    }
    loadMatches(userIntent);
  };

  return (
    <div className="p-8 space-y-6 min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-background to-purple-900/10"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      
      <div className="animate-fade-in relative z-10">
        <h1 className="text-4xl font-bold font-heading mb-2 flex items-center gap-3">
          <Users className="h-10 w-10 text-primary" />
          <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Discover People
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">Students with similar interests</p>
      </div>

      {/* Intent Prompt Section */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/30 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <Label htmlFor="intent-prompt" className="text-base font-semibold">
              What are you looking for?
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Describe what you're seeking - teammates for a project, study partners, friends with similar hobbies, etc.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Textarea
              id="intent-prompt"
              placeholder="e.g., Looking for teammates for a hackathon project, need study partners for CS classes, want to find friends who love gaming..."
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSearch();
                }
              }}
              className="min-h-[100px] resize-none flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || loading || !userIntent.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground sm:w-auto w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? "Matching..." : "Find Matches"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12 relative z-10">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Finding your matches...</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !loading && (
        <>
          {matches.length > 0 ? (
            <>
              <div className="relative z-10">
                <h2 className="text-2xl font-semibold mb-4">
                  Found {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in relative z-10" style={{ animationDelay: '0.1s' }}>
                {matches.map((person) => (
          <Card
            key={person.id}
            className="p-6 bg-card/30 backdrop-blur-sm hover:bg-card/50 border border-border/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 group-hover:scale-110 transition-transform">
                  <AvatarImage 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random&color=fff&size=128&bold=true`}
                    alt={person.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {person.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{person.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {person.major}
                  </p>
                  <p className="text-sm text-muted-foreground">{person.year}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {Math.round(person.matchScore)}%
                </p>
                <p className="text-xs text-muted-foreground">match</p>
              </div>
            </div>

            {person.bio && (
              <p className="text-sm text-foreground line-clamp-2">{person.bio}</p>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Common Interests</p>
              <div className="flex flex-wrap gap-2">
                {person.commonTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {person.looking_for && person.looking_for.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Looking For</p>
                <div className="flex flex-wrap gap-1">
                  {person.looking_for.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-md text-xs bg-card border border-border text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button 
              className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:scale-105 transition-all"
              variant="outline"
              onClick={() => navigate(`/messages?user=${person.id}`)}
            >
              Send Message
            </Button>
          </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-8 text-center relative z-10">
              <p className="text-muted-foreground text-lg">
                No matches found. Try adjusting your search prompt.
              </p>
            </Card>
          )}
        </>
      )}

      {/* Initial State - No search yet */}
      {!hasSearched && !loading && (
        <Card className="p-8 text-center relative z-10">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">
            Enter a prompt above to discover people who match your interests
          </p>
        </Card>
      )}
    </div>
  );
};

export default DiscoverPeople;