import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

const INTEREST_SUGGESTIONS = [
  "Metal", "Rammstein", "Classical", "Hip-Hop", "Techno", "Jazz",
  "Soccer", "Champions League", "NBA", "NFL", "F1", "MLB",
  "Civilization", "Valorant", "League of Legends", "Elden Ring",
  "Philosophy", "AI", "Robotics", "Embedded Systems",
  "Gym", "Night Owl", "Coffee", "Movies", "Anime", "Reading"
];

const LOOKING_FOR_OPTIONS = [
  "Watch parties",
  "Study friends",
  "Hobby groups",
  "Deep conversation groups",
  "Gaming buddies",
  "Sports fans"
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag("");
    }
  };

  const toggleLookingFor = (option: string) => {
    setLookingFor(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTags.length === 0) {
      toast.error("Please select at least one interest tag");
      return;
    }

    if (lookingFor.length === 0) {
      toast.error("Please select what you're looking for");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          bio,
          tags: selectedTags,
          looking_for: lookingFor,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile completed!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 relative overflow-hidden">
      {/* Subtle background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-blue-900/10"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-10 animate-fade-in text-center">
          <h1 className="text-5xl font-bold font-heading text-foreground mb-3">
            Complete Your Profile
          </h1>
          <p className="text-xl text-muted-foreground">Tell us about your interests to find your people</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Left: Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground font-semibold text-base">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself... What makes you unique?"
                  rows={4}
                  className="resize-none bg-card/30 border-border/30"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-foreground font-semibold text-base">Interest Tags</Label>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_SUGGESTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-primary/20 text-primary border border-primary/50"
                          : "bg-card/30 border border-border/30 text-foreground hover:bg-card/50 hover:scale-105"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom tag..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                    className="bg-card/30 border-border/30"
                  />
                  <Button 
                    type="button" 
                    onClick={addCustomTag} 
                    variant="secondary"
                    className="hover:scale-105 transition-transform"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground font-semibold text-base">What are you looking for?</Label>
                <p className="text-sm text-muted-foreground">Choose your goals</p>
                <div className="grid grid-cols-2 gap-3">
                  {LOOKING_FOR_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleLookingFor(option)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                        lookingFor.includes(option)
                          ? "bg-primary/20 text-primary border border-primary/50"
                          : "bg-card/30 border border-border/30 hover:bg-card/50 hover:scale-105 text-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 hover:scale-105 transition-all" 
                disabled={loading}
              >
                {loading ? "Saving..." : "Complete Profile & Continue →"}
              </Button>
            </form>
          </div>

          {/* Right: Preview */}
          <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/30 space-y-6 h-fit sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              <h3 className="text-2xl font-bold font-heading text-foreground">
                Profile Preview
              </h3>
            </div>
            
            {bio && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Bio</p>
                <p className="text-foreground leading-relaxed">{bio}</p>
              </div>
            )}

            {selectedTags.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Interests ({selectedTags.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-sm bg-primary/10 border border-primary/20 text-primary font-medium flex items-center gap-2 group"
                    >
                      {tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="hover:scale-110 transition-transform"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {lookingFor.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Looking For</p>
                <div className="space-y-2">
                  {lookingFor.map((item) => (
                    <div
                      key={item}
                      className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-foreground text-sm font-medium"
                    >
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!bio && selectedTags.length === 0 && lookingFor.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <div className="text-6xl mb-4">👋</div>
                <p className="text-muted-foreground">Your profile preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;