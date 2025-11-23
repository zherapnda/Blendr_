/**
 * Admin page to seed the database with sample data
 * This page can be accessed to populate the database with 10 sample users and groups
 * 
 * Note: This requires the user to be authenticated and have admin privileges
 * For demo purposes, this will work if you're logged in
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Database, Loader2, Users, UserPlus } from "lucide-react";

const SeedData = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  // Sample profiles data - 2 CS students for hackathon matching
  const sampleProfiles = [
    // CS Students for hackathon (these should match hackathon searches)
    {
      name: "Alex Chen",
      email: `alex.chen.${Date.now()}@example.com`,
      major: "Computer Science",
      year: "Junior",
      bio: "Passionate CS student looking for hackathon teammates. Experienced in React, Node.js, and Python. Love building web apps and solving complex problems.",
      tags: ["AI", "Robotics", "React", "Python", "Hackathon", "Web Development"],
      looking_for: ["Study friends", "Gaming buddies"]
    },
    {
      name: "Jordan Martinez",
      email: `jordan.martinez.${Date.now()}@example.com`,
      major: "Computer Science",
      year: "Sophomore",
      bio: "CS major interested in hackathons and collaborative projects. Strong in backend development and databases. Always looking for teammates for coding competitions.",
      tags: ["Embedded Systems", "AI", "Python", "Hackathon", "Project"],
      looking_for: ["Study friends", "Hobby groups"]
    },
    // Other diverse profiles
    {
      name: "Sam Taylor",
      email: `sam.taylor.${Date.now()}@example.com`,
      major: "Business",
      year: "Senior",
      bio: "Business major with a passion for entrepreneurship. Love networking and meeting new people.",
      tags: ["Coffee", "Movies", "Reading"],
      looking_for: ["Watch parties", "Deep conversation groups"]
    },
    {
      name: "Morgan Lee",
      email: `morgan.lee.${Date.now()}@example.com`,
      major: "Engineering",
      year: "Junior",
      bio: "Engineering student who loves sports and fitness. Looking for gym buddies and sports fans.",
      tags: ["Gym", "Soccer", "Champions League", "F1"],
      looking_for: ["Sports fans", "Hobby groups"]
    },
    {
      name: "Riley Johnson",
      email: `riley.johnson.${Date.now()}@example.com`,
      major: "Psychology",
      year: "Sophomore",
      bio: "Psychology major interested in deep conversations and philosophy. Night owl who loves coffee.",
      tags: ["Philosophy", "Coffee", "Night Owl", "Reading"],
      looking_for: ["Deep conversation groups", "Study friends"]
    },
    {
      name: "Casey Williams",
      email: `casey.williams.${Date.now()}@example.com`,
      major: "Music",
      year: "Senior",
      bio: "Music major who loves all genres. Always down to discuss music and go to concerts.",
      tags: ["Metal", "Rammstein", "Classical", "Hip-Hop", "Jazz"],
      looking_for: ["Hobby groups", "Watch parties"]
    },
    {
      name: "Taylor Brown",
      email: `taylor.brown.${Date.now()}@example.com`,
      major: "Mathematics",
      year: "Junior",
      bio: "Math major who enjoys gaming and coding in my free time. Looking for study partners.",
      tags: ["Valorant", "League of Legends", "AI", "Philosophy"],
      looking_for: ["Study friends", "Gaming buddies"]
    },
    {
      name: "Jamie Davis",
      email: `jamie.davis.${Date.now()}@example.com`,
      major: "Biology",
      year: "Sophomore",
      bio: "Biology student who loves anime and movies. Looking for friends with similar interests.",
      tags: ["Anime", "Movies", "Reading", "Coffee"],
      looking_for: ["Watch parties", "Hobby groups"]
    },
    {
      name: "Quinn Anderson",
      email: `quinn.anderson.${Date.now()}@example.com`,
      major: "Physics",
      year: "Senior",
      bio: "Physics major interested in robotics and embedded systems. Love tinkering with hardware.",
      tags: ["Robotics", "Embedded Systems", "AI", "Gym"],
      looking_for: ["Hobby groups", "Study friends"]
    },
    {
      name: "Avery Wilson",
      email: `avery.wilson.${Date.now()}@example.com`,
      major: "Economics",
      year: "Junior",
      bio: "Economics major who enjoys sports and gaming. Always up for watching games or playing together.",
      tags: ["NBA", "NFL", "Valorant", "Elden Ring", "Gym"],
      looking_for: ["Sports fans", "Gaming buddies"]
    }
  ];

  // Sample groups data
  const sampleGroups = [
    {
      name: "Hackathon Enthusiasts",
      description: "A group for students interested in hackathons, coding competitions, and collaborative projects. Share ideas, find teammates, and build amazing things together!",
      tags: ["Hackathon", "Project", "AI", "Web Development"],
      external_link: null
    },
    {
      name: "Study Group Central",
      description: "Connect with study partners across all majors. Find people to study with, share notes, and ace your classes together.",
      tags: ["Study", "Academic"],
      external_link: null
    },
    {
      name: "Gaming Squad",
      description: "For all the gamers out there! Find teammates for Valorant, League of Legends, and other games. Casual and competitive players welcome.",
      tags: ["Gaming", "Valorant", "League of Legends", "Elden Ring"],
      external_link: null
    },
    {
      name: "Sports Fans United",
      description: "Watch parties, game discussions, and sports talk. Whether you're into soccer, basketball, or F1, this is your group!",
      tags: ["Soccer", "NBA", "NFL", "F1", "Champions League"],
      external_link: null
    },
    {
      name: "Music Lovers",
      description: "Share your favorite music, discover new artists, and connect with fellow music enthusiasts. All genres welcome!",
      tags: ["Metal", "Hip-Hop", "Jazz", "Classical"],
      external_link: null
    }
  ];

  const seedData = async () => {
    try {
      setLoading(true);
      setProgress("Starting seed process...");

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      let groupsCreated = 0;
      let membershipsCreated = 0;

      // Step 1: Try to create groups directly (this should work)
      setProgress("Creating groups...");
      
      for (const group of sampleGroups) {
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .insert({
            name: group.name,
            description: group.description,
            tags: group.tags,
            external_link: group.external_link,
            created_by: user.id
          })
          .select()
          .single();

        if (!groupError && groupData) {
          groupsCreated++;
          // Add current user as a member
          await supabase.from('group_memberships').insert({
            user_id: user.id,
            group_id: groupData.id
          });
          membershipsCreated++;
        }
      }

      // Step 2: Try Edge Function for users (may fail, but groups are created)
      setProgress("Creating users (this may require Edge Function deployment)...");
      
      try {
        const { data, error } = await supabase.functions.invoke("seed-data", {
          body: {}
        });

        if (!error && data?.success) {
          toast.success(
            `Successfully seeded! Created ${data.stats.users} users, ${groupsCreated + data.stats.groups} groups, and ${membershipsCreated + data.stats.memberships} memberships.`
          );
          setProgress(`✅ Created ${data.stats.users} users, ${groupsCreated + data.stats.groups} groups, and ${membershipsCreated + data.stats.memberships} memberships`);
        } else {
          // Edge function failed, but groups were created
          toast.success(
            `Groups created successfully! Created ${groupsCreated} groups. ` +
            `Note: User creation requires Edge Function deployment. See instructions below.`
          );
          setProgress(`✅ Created ${groupsCreated} groups. Users require Edge Function or command line script.`);
        }
      } catch (funcError) {
        // Edge function not available, but groups are created
        toast.success(
          `Groups created! Created ${groupsCreated} groups. ` +
          `To create users, use the command line method (see instructions).`
        );
        setProgress(`✅ Created ${groupsCreated} groups. Check instructions for creating users.`);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error seeding data:", error);
      toast.error(`Failed to seed data: ${error instanceof Error ? error.message : "Unknown error"}`);
      setProgress("❌ Seeding failed. Check console for details.");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Seed Database</h1>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sample Data
            </h2>
            <p className="text-muted-foreground">
              This will create 10 sample users (including 2 CS students optimized for hackathon searches) 
              and 5 groups in your database.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-semibold">📝 Note:</p>
            <p className="text-sm text-muted-foreground">
              This will create 5 groups immediately. User creation requires Edge Function deployment or command line.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>To create users:</strong> Use the command line method:
            </p>
            <div className="bg-background p-3 rounded mt-2 text-xs font-mono space-y-1">
              <p>1. Get your Supabase Service Role Key from Dashboard → Settings → API</p>
              <p>2. Run in PowerShell:</p>
              <p className="ml-4">$env:SUPABASE_URL="your_url"</p>
              <p className="ml-4">$env:SUPABASE_SERVICE_ROLE_KEY="your_key"</p>
              <p className="ml-4">npm run seed</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Users to be created:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li><strong>Alex Chen</strong> - CS Junior (Hackathon optimized) 🎯</li>
              <li><strong>Jordan Martinez</strong> - CS Sophomore (Hackathon optimized) 🎯</li>
              <li>Sam Taylor - Business Senior</li>
              <li>Morgan Lee - Engineering Junior</li>
              <li>Riley Johnson - Psychology Sophomore</li>
              <li>Casey Williams - Music Senior</li>
              <li>Taylor Brown - Mathematics Junior</li>
              <li>Jamie Davis - Biology Sophomore</li>
              <li>Quinn Anderson - Physics Senior</li>
              <li>Avery Wilson - Economics Junior</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Groups to be created:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Hackathon Enthusiasts</li>
              <li>Study Group Central</li>
              <li>Gaming Squad</li>
              <li>Sports Fans United</li>
              <li>Music Lovers</li>
            </ul>
          </div>

          {progress && (
            <div className="bg-primary/10 p-3 rounded text-sm">
              {progress}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={seedData}
              disabled={loading}
              className="bg-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Seed Database
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SeedData;

