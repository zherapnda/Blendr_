import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sample profiles data - 2 CS students for hackathon matching
const sampleProfiles = [
  // CS Students for hackathon (these should match hackathon searches)
  {
    name: "Alex Chen",
    email: `alex.chen.seed${Date.now()}@example.com`,
    major: "Computer Science",
    year: "Junior",
    bio: "Passionate CS student looking for hackathon teammates. Experienced in React, Node.js, and Python. Love building web apps and solving complex problems.",
    tags: ["AI", "Robotics", "React", "Python", "Hackathon", "Web Development"],
    looking_for: ["Study friends", "Gaming buddies"]
  },
  {
    name: "Jordan Martinez",
    email: `jordan.martinez.seed${Date.now()}@example.com`,
    major: "Computer Science",
    year: "Sophomore",
    bio: "CS major interested in hackathons and collaborative projects. Strong in backend development and databases. Always looking for teammates for coding competitions.",
    tags: ["Embedded Systems", "AI", "Python", "Hackathon", "Project"],
    looking_for: ["Study friends", "Hobby groups"]
  },
  // Other diverse profiles
  {
    name: "Sam Taylor",
    email: `sam.taylor.seed${Date.now()}@example.com`,
    major: "Business",
    year: "Senior",
    bio: "Business major with a passion for entrepreneurship. Love networking and meeting new people.",
    tags: ["Coffee", "Movies", "Reading"],
    looking_for: ["Watch parties", "Deep conversation groups"]
  },
  {
    name: "Morgan Lee",
    email: `morgan.lee.seed${Date.now()}@example.com`,
    major: "Engineering",
    year: "Junior",
    bio: "Engineering student who loves sports and fitness. Looking for gym buddies and sports fans.",
    tags: ["Gym", "Soccer", "Champions League", "F1"],
    looking_for: ["Sports fans", "Hobby groups"]
  },
  {
    name: "Riley Johnson",
    email: `riley.johnson.seed${Date.now()}@example.com`,
    major: "Psychology",
    year: "Sophomore",
    bio: "Psychology major interested in deep conversations and philosophy. Night owl who loves coffee.",
    tags: ["Philosophy", "Coffee", "Night Owl", "Reading"],
    looking_for: ["Deep conversation groups", "Study friends"]
  },
  {
    name: "Casey Williams",
    email: `casey.williams.seed${Date.now()}@example.com`,
    major: "Music",
    year: "Senior",
    bio: "Music major who loves all genres. Always down to discuss music and go to concerts.",
    tags: ["Metal", "Rammstein", "Classical", "Hip-Hop", "Jazz"],
    looking_for: ["Hobby groups", "Watch parties"]
  },
  {
    name: "Taylor Brown",
    email: `taylor.brown.seed${Date.now()}@example.com`,
    major: "Mathematics",
    year: "Junior",
    bio: "Math major who enjoys gaming and coding in my free time. Looking for study partners.",
    tags: ["Valorant", "League of Legends", "AI", "Philosophy"],
    looking_for: ["Study friends", "Gaming buddies"]
  },
  {
    name: "Jamie Davis",
    email: `jamie.davis.seed${Date.now()}@example.com`,
    major: "Biology",
    year: "Sophomore",
    bio: "Biology student who loves anime and movies. Looking for friends with similar interests.",
    tags: ["Anime", "Movies", "Reading", "Coffee"],
    looking_for: ["Watch parties", "Hobby groups"]
  },
  {
    name: "Quinn Anderson",
    email: `quinn.anderson.seed${Date.now()}@example.com`,
    major: "Physics",
    year: "Senior",
    bio: "Physics major interested in robotics and embedded systems. Love tinkering with hardware.",
    tags: ["Robotics", "Embedded Systems", "AI", "Gym"],
    looking_for: ["Hobby groups", "Study friends"]
  },
  {
    name: "Avery Wilson",
    email: `avery.wilson.seed${Date.now()}@example.com`,
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🌱 Starting database seeding...");

    const createdUserIds: string[] = [];

    // Step 1: Create auth users and profiles
    console.log("📝 Creating users and profiles...");
    for (const profile of sampleProfiles) {
      // Generate a random password
      const tempPassword = `TempPass${Math.random().toString(36).substring(2, 10)}!`;
      
      // Create auth user using admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: profile.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: profile.name,
          major: profile.major,
          year: profile.year
        }
      });

      if (authError) {
        console.error(`❌ Error creating user ${profile.name}:`, authError.message);
        continue;
      }

      const userId = authData.user.id;
      createdUserIds.push(userId);

      // Update profile with bio, tags, and looking_for
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          bio: profile.bio,
          tags: profile.tags,
          looking_for: profile.looking_for
        })
        .eq('id', userId);

      if (profileError) {
        console.error(`❌ Error updating profile for ${profile.name}:`, profileError.message);
      } else {
        console.log(`✅ Created profile for ${profile.name} (${profile.major})`);
      }
    }

    console.log(`✅ Created ${createdUserIds.length} users and profiles`);

    // Step 2: Create groups
    console.log("👥 Creating groups...");
    const createdGroupIds: string[] = [];

    for (const group of sampleGroups) {
      // Use the first created user as the creator
      const creatorId = createdUserIds[0] || createdUserIds[Math.floor(Math.random() * createdUserIds.length)];

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: group.name,
          description: group.description,
          tags: group.tags,
          external_link: group.external_link,
          created_by: creatorId
        })
        .select()
        .single();

      if (groupError) {
        console.error(`❌ Error creating group ${group.name}:`, groupError.message);
      } else {
        createdGroupIds.push(groupData.id);
        console.log(`✅ Created group: ${group.name}`);
      }
    }

    console.log(`✅ Created ${createdGroupIds.length} groups`);

    // Step 3: Add some members to groups
    console.log("🔗 Adding members to groups...");
    let membershipsAdded = 0;

    for (let i = 0; i < createdGroupIds.length; i++) {
      const groupId = createdGroupIds[i];
      // Add 3-5 random users to each group
      const numMembers = Math.min(5, createdUserIds.length);
      const shuffled = [...createdUserIds].sort(() => 0.5 - Math.random());
      const members = shuffled.slice(0, numMembers);

      for (const userId of members) {
        const { error: membershipError } = await supabase
          .from('group_memberships')
          .insert({
            user_id: userId,
            group_id: groupId
          });

        if (!membershipError) {
          membershipsAdded++;
        }
      }
    }

    console.log(`✅ Added ${membershipsAdded} group memberships`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Database seeded successfully",
        stats: {
          users: createdUserIds.length,
          groups: createdGroupIds.length,
          memberships: membershipsAdded
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Fatal error during seeding:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

