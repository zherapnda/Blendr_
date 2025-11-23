import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlusCircle, X } from "lucide-react";
import { z } from "zod";

const TAG_SUGGESTIONS = [
  "Metal", "Rammstein", "Classical", "Hip-Hop", "Techno", "Jazz",
  "Soccer", "Champions League", "NBA", "NFL", "F1", "MLB",
  "Civilization", "Valorant", "League of Legends", "Elden Ring",
  "Philosophy", "AI", "Robotics", "Embedded Systems",
  "Gym", "Movies", "Anime", "Reading", "Coffee", "Night Owl"
];

const groupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  tags: z.array(z.string()).min(1, "Select at least one tag"),
  externalLink: z.string().url("Must be a valid URL").or(z.literal("")),
});

const CreateGroup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [externalLink, setExternalLink] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = groupSchema.parse({
        name,
        description,
        tags: selectedTags,
        externalLink,
      });

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data: groupData, error } = await supabase
        .from("groups")
        .insert({
          name: validatedData.name,
          description: validatedData.description,
          tags: validatedData.tags,
          external_link: validatedData.externalLink || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator to the group
      await supabase.from("group_memberships").insert({
        user_id: user.id,
        group_id: groupData.id,
      });

      toast.success("Group created successfully!");
      navigate("/discover-groups");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-background to-purple-900/10"></div>
      <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      
      <div className="mb-8 animate-fade-in relative z-10">
        <h1 className="text-4xl font-bold font-heading mb-2 flex items-center gap-3">
          <PlusCircle className="h-10 w-10 text-primary" />
          <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Create a Group
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">Start a new micro-community</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 animate-fade-in relative z-10" style={{ animationDelay: '0.1s' }}>
        {/* Left: Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rammstein"
                required
                className="bg-card/30 border-border/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-semibold">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A group for Rammstein fans to discuss, share, and attend concerts together..."
                rows={4}
                className="resize-none bg-card/30 border-border/30"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
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
                <Button type="button" onClick={addCustomTag} variant="secondary" className="hover:scale-105 transition-transform">
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalLink" className="text-foreground font-semibold">External Link (Optional)</Label>
              <Input
                id="externalLink"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://discord.gg/... or WhatsApp/GroupMe link"
                type="url"
                className="bg-card/30 border-border/30"
              />
              <p className="text-xs text-muted-foreground">
                Add a WhatsApp, Discord, or GroupMe link for members to join
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20" 
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </form>
        </div>

        {/* Right: Preview */}
        <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/30 space-y-4 h-fit sticky top-8">
          <h3 className="text-xl font-semibold text-foreground">Preview</h3>

          <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
            <PlusCircle className="h-10 w-10 text-primary" />
          </div>

          {name && (
            <div>
              <h4 className="font-bold text-lg text-foreground">{name}</h4>
            </div>
          )}

          {description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground">{description}</p>
            </div>
          )}

          {selectedTags.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tags ({selectedTags.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 font-medium flex items-center gap-1"
                  >
                    {tag}
                    <button onClick={() => toggleTag(tag)}>
                      <X className="h-3 w-3 hover:scale-110 transition-transform" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {externalLink && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">External Link</p>
              <p className="text-xs text-primary truncate">{externalLink}</p>
            </div>
          )}

          {!name && !description && selectedTags.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Fill out the form to see a preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;