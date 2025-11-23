import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Profile {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
  tags: string[];
  bio: string;
  looking_for: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, userIntent } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current user's profile
    const { data: currentUser, error: currentUserError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (currentUserError || !currentUser) {
      console.error("Error fetching current user:", currentUserError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all other users
    const { data: otherUsers, error: otherUsersError } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", userId);

    if (otherUsersError) {
      console.error("Error fetching other users:", otherUsersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch users" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otherUsers || otherUsers.length === 0) {
      return new Response(
        JSON.stringify({ matches: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Intent-based matching algorithm (mock/demo implementation)
    const analyzeIntent = (intent: string): {
      keywords: string[];
      intentType: 'teammate' | 'friend' | 'study' | 'hobby' | 'general';
      boostMultiplier: number;
    } => {
      if (!intent || intent.trim() === "") {
        return { keywords: [], intentType: 'general', boostMultiplier: 1.0 };
      }

      const lowerIntent = intent.toLowerCase();
      const keywords: string[] = [];
      let intentType: 'teammate' | 'friend' | 'study' | 'hobby' | 'general' = 'general';
      let boostMultiplier = 1.0;

      // Extract intent type and keywords
      if (lowerIntent.includes('teammate') || lowerIntent.includes('team') || 
          lowerIntent.includes('project') || lowerIntent.includes('hackathon') ||
          lowerIntent.includes('collaborat')) {
        intentType = 'teammate';
        boostMultiplier = 1.5;
        keywords.push('teammate', 'team', 'project', 'collaboration', 'hackathon');
      } else if (lowerIntent.includes('study') || lowerIntent.includes('homework') ||
                 lowerIntent.includes('class') || lowerIntent.includes('course')) {
        intentType = 'study';
        boostMultiplier = 1.4;
        keywords.push('study', 'homework', 'class', 'course', 'academic');
      } else if (lowerIntent.includes('friend') || lowerIntent.includes('hangout') ||
                 lowerIntent.includes('social') || lowerIntent.includes('chat')) {
        intentType = 'friend';
        boostMultiplier = 1.3;
        keywords.push('friend', 'social', 'hangout', 'chat');
      } else if (lowerIntent.includes('hobby') || lowerIntent.includes('gaming') ||
                 lowerIntent.includes('sport') || lowerIntent.includes('music') ||
                 lowerIntent.includes('gym') || lowerIntent.includes('fitness')) {
        intentType = 'hobby';
        boostMultiplier = 1.35;
        keywords.push('hobby', 'gaming', 'sport', 'music', 'gym', 'fitness');
      }

      // Extract additional keywords from the intent
      const words = lowerIntent.split(/\s+/).filter(word => 
        word.length > 3 && 
        !['looking', 'for', 'want', 'need', 'find', 'seeking', 'searching'].includes(word)
      );
      keywords.push(...words);

      return { keywords, intentType, boostMultiplier };
    };

    const intentAnalysis = analyzeIntent(userIntent || "");

    // Calculate match scores with intent-based matching
    const matches = otherUsers.map((user: Profile) => {
      const currentTags = new Set<string>(currentUser.tags || []);
      const userTags = new Set<string>(user.tags || []);
      
      // Find common tags
      const commonTags = Array.from(currentTags).filter((tag: string) => userTags.has(tag));
      
      // Calculate base score from tag overlap
      const allTags = new Set([...currentTags, ...userTags]);
      let score = allTags.size > 0 ? (commonTags.length / allTags.size) * 100 : 0;
      
      // Bonus for same major
      if (user.major === currentUser.major) {
        score += 5;
      }
      
      // Bonus for same year
      if (user.year === currentUser.year) {
        score += 5;
      }

      // Intent-based matching boost
      if (userIntent && userIntent.trim() !== "") {
        let intentScore = 0;
        const userProfileText = [
          ...(user.looking_for || []),
          ...(user.tags || []),
          user.bio || "",
          user.major || ""
        ].join(" ").toLowerCase();

        // Check if user's profile matches intent keywords
        intentAnalysis.keywords.forEach(keyword => {
          if (userProfileText.includes(keyword.toLowerCase())) {
            intentScore += 10; // Boost for each matching keyword
          }
        });

        // Check if user's "looking_for" matches intent type
        const userLookingFor = (user.looking_for || []).join(" ").toLowerCase();
        if (intentAnalysis.intentType === 'teammate' && 
            (userLookingFor.includes('study') || userLookingFor.includes('project'))) {
          intentScore += 15;
        } else if (intentAnalysis.intentType === 'study' && 
                   userLookingFor.includes('study')) {
          intentScore += 15;
        } else if (intentAnalysis.intentType === 'friend' && 
                   (userLookingFor.includes('friend') || userLookingFor.includes('social'))) {
          intentScore += 15;
        } else if (intentAnalysis.intentType === 'hobby' && 
                   (userLookingFor.includes('hobby') || userLookingFor.includes('gaming'))) {
          intentScore += 15;
        }

        // Apply intent boost multiplier
        score = (score + intentScore) * intentAnalysis.boostMultiplier;
      }
      
      // Cap at 100
      score = Math.min(score, 100);
      
      return {
        ...user,
        matchScore: score,
        commonTags,
      };
    });

    // Sort by match score (highest first) and filter out zero matches
    const sortedMatches = matches
      .filter(m => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Found ${sortedMatches.length} matches for user ${userId}${userIntent ? ` with intent: "${userIntent}"` : ''}`);

    return new Response(
      JSON.stringify({ matches: sortedMatches }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in match-users function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});