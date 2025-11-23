# Database Seeding

This directory contains scripts to seed your database with sample data for testing and demos.

## Quick Start

### Option 1: Using the Web Interface (Recommended)

1. Start your development server: `npm run dev`
2. Log in to your application
3. Navigate to: `http://localhost:8080/seed-data`
4. Click the "Seed Database" button

This will create:
- **10 sample users** (including 2 CS students optimized for hackathon searches)
- **5 sample groups**
- **Group memberships** connecting users to groups

### Option 2: Using the Command Line Script

1. Make sure you have your Supabase credentials set:
   ```bash
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the seed script:
   ```bash
   npm run seed
   ```

## Sample Users Created

### CS Students (Hackathon Optimized) 🎯
- **Alex Chen** - CS Junior
  - Tags: AI, Robotics, React, Python, Hackathon, Web Development
  - Bio mentions: "hackathon teammates", "React", "Node.js", "Python"
  - Will appear when searching for: "hackathon", "teammates", "project", "collaboration"

- **Jordan Martinez** - CS Sophomore
  - Tags: Embedded Systems, AI, Python, Hackathon, Project
  - Bio mentions: "hackathons", "collaborative projects", "teammates for coding competitions"
  - Will appear when searching for: "hackathon", "teammates", "project", "collaboration"

### Other Users
- Sam Taylor - Business Senior
- Morgan Lee - Engineering Junior
- Riley Johnson - Psychology Sophomore
- Casey Williams - Music Senior
- Taylor Brown - Mathematics Junior
- Jamie Davis - Biology Sophomore
- Quinn Anderson - Physics Senior
- Avery Wilson - Economics Junior

## Sample Groups Created

1. **Hackathon Enthusiasts** - For hackathon and coding competition enthusiasts
2. **Study Group Central** - Connect with study partners
3. **Gaming Squad** - For gamers
4. **Sports Fans United** - Sports watch parties and discussions
5. **Music Lovers** - Music enthusiasts

## Testing the Hackathon Matching

To test that the CS students appear when searching for hackathon-related content:

1. Go to the Discover People page
2. Enter a prompt like:
   - "Looking for teammates for a hackathon project"
   - "Need hackathon teammates"
   - "Want to find people for a coding project"
3. Click "Find Matches"
4. You should see **Alex Chen** and **Jordan Martinez** appear in the results with high match scores

## Notes

- The seed function uses Supabase Edge Functions with admin access to create auth users
- All users are created with temporary passwords (they won't be able to log in)
- Emails are generated with timestamps to avoid duplicates
- You can run the seed multiple times, but it will create new users each time

