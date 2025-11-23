import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grid3x3, Search, ExternalLink, PlusCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Group {
  id: string;
  name: string;
  description: string;
  tags: string[];
  external_link: string | null;
  member_count?: number;
}

const DiscoverGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUserId(user.id);

        const { data: groupsData, error } = await supabase
          .from("groups")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (groupsData) {
          // Get member counts
          const groupsWithCounts = await Promise.all(
            groupsData.map(async (group) => {
              const { count, error: countError } = await supabase
                .from("group_memberships")
                .select("*", { count: "exact", head: true })
                .eq("group_id", group.id);
              return { ...group, member_count: count || 0 };
            })
          );

          setGroups(groupsWithCounts);
          setFilteredGroups(groupsWithCounts);

          // Extract all unique tags
          const tags = new Set<string>();
          groupsData.forEach((group) => {
            if (group.tags && Array.isArray(group.tags)) {
              group.tags.forEach((tag: string) => tags.add(tag));
            }
          });
          setAllTags(Array.from(tags).sort());
          
          if (groupsWithCounts.length === 0) {
            console.log("No groups found in database. Run the seed script to add sample groups.");
          }
        } else {
          console.log("No groups data returned");
        }
      } catch (error) {
        console.error("Error loading groups:", error);
        toast.error("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [navigate]);

  useEffect(() => {
    let filtered = groups;

    if (searchTerm) {
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((group) => group.tags.includes(selectedTag));
    }

    setFilteredGroups(filtered);
  }, [searchTerm, selectedTag, groups]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from("group_memberships")
        .insert({ user_id: userId, group_id: groupId });

      if (error) {
        if (error.code === "23505") {
          toast.error("You're already a member of this group");
        } else {
          throw error;
        }
      } else {
        toast.success("Joined group successfully!");
        // Refresh groups to update member count
        const { data } = await supabase
          .from("groups")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) setGroups(data);
      }
    } catch (error) {
      toast.error("Failed to join group");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-blue-900/10"></div>
      <div className="absolute top-1/2 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      
      <div className="animate-fade-in relative z-10">
        <h1 className="text-4xl font-bold font-heading mb-2 flex items-center gap-3">
          <Grid3x3 className="h-10 w-10 text-primary" />
          <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Discover Groups
          </span>
        </h1>
        <p className="text-muted-foreground text-lg">Find your micro-community</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 animate-fade-in relative z-10" style={{ animationDelay: '0.1s' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search groups..."
            className="pl-10 bg-card/30 border-border/30"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedTag === ""
                ? "bg-primary/20 text-primary border border-primary/50"
                : "bg-card/30 border border-border/30 text-foreground hover:bg-card/50 hover:scale-105"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTag === tag
                  ? "bg-primary/20 text-primary border border-primary/50"
                  : "bg-card/30 border border-border/30 text-foreground hover:bg-card/50 hover:scale-105"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in relative z-10" style={{ animationDelay: '0.2s' }}>
        {filteredGroups.map((group) => (
          <Card
            key={group.id}
            className="p-6 bg-card/30 backdrop-blur-sm hover:bg-card/50 border border-border/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 space-y-4 group"
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                <AvatarImage 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=random&color=fff&size=128&bold=true&format=png`}
                  alt={group.name}
                  className="rounded-lg"
                />
                <AvatarFallback className="bg-primary/10 text-primary rounded-lg">
                  <Grid3x3 className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground mb-1">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {group.member_count || 0} {(group.member_count || 0) === 1 ? "member" : "members"}
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground line-clamp-3">{group.description}</p>

            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:scale-105 transition-all" 
                variant="outline"
                onClick={() => handleJoinGroup(group.id)}
              >
                Join Group
              </Button>
              {group.external_link && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(group.external_link!, "_blank")}
                  className="hover:scale-110 transition-transform"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <Grid3x3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-foreground mb-2">No groups found</p>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedTag
              ? "Try adjusting your filters"
              : "Be the first to create a group!"}
          </p>
          <Button onClick={() => navigate("/create-group")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiscoverGroups;