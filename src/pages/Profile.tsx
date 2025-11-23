import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Edit2, Save, ArrowLeft } from "lucide-react";
import { z } from "zod";

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

const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  tags: z.array(z.string()).min(1, "Select at least one interest tag"),
  looking_for: z.array(z.string()).min(1, "Select what you're looking for"),
});

interface Profile {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
  bio: string | null;
  tags: string[];
  looking_for: string[];
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Edit form state
  const [bio, setBio] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profileData) {
        setProfile(profileData);
        setBio(profileData.bio || "");
        setSelectedTags(profileData.tags || []);
        setLookingFor(profileData.looking_for || []);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    try {
      const validatedData = profileSchema.parse({
        bio: bio || undefined,
        tags: selectedTags,
        looking_for: lookingFor,
      });

      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          bio: validatedData.bio || null,
          tags: validatedData.tags,
          looking_for: validatedData.looking_for,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setBio(profile.bio || "");
      setSelectedTags(profile.tags || []);
      setLookingFor(profile.looking_for || []);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold font-heading text-foreground mb-2">
                My Profile
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                {profile.major} • {profile.year}
              </p>
            </div>
            
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-primary hover:bg-primary/90 hover:scale-105 transition-all"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="hover:scale-105 transition-transform"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 hover:scale-105 transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Left: Profile Info */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/30 space-y-4">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                Basic Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Name</p>
                  <p className="text-lg text-foreground font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Email</p>
                  <p className="text-lg text-foreground font-medium">{profile.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Major</p>
                    <p className="text-lg text-foreground font-medium">{profile.major}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Year</p>
                    <p className="text-lg text-foreground font-medium">{profile.year}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/30 space-y-4">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                About Me
              </h2>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-foreground font-semibold">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="resize-none bg-card/30 border-border/30"
                  />
                  <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
                </div>
              ) : (
                <p className="text-foreground leading-relaxed">
                  {profile.bio || "No bio added yet."}
                </p>
              )}
            </div>
          </div>

          {/* Right: Interests & Looking For */}
          <div className="space-y-6">
            {/* Interests */}
            <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/30 space-y-4">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                Interests ({selectedTags.length})
              </h2>
              
              {isEditing ? (
                <div className="space-y-4">
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
                  <div className="flex gap-2">
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
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.tags && profile.tags.length > 0 ? (
                    profile.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 rounded-full text-sm bg-primary/10 border border-primary/20 text-primary font-medium"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No interests added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Looking For */}
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-lg space-y-4">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                Looking For
              </h2>
              
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  {LOOKING_FOR_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleLookingFor(option)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left ${
                        lookingFor.includes(option)
                          ? "bg-primary/20 text-primary border border-primary scale-105"
                          : "bg-card border border-border hover:bg-card-hover hover:scale-105 text-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.looking_for && profile.looking_for.length > 0 ? (
                    profile.looking_for.map((item) => (
                      <div
                        key={item}
                        className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-foreground text-sm font-medium"
                      >
                        ✓ {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Nothing selected yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
