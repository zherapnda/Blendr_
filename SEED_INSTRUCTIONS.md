# How to Seed the Database with Sample Data

## Step-by-Step Instructions

### Method 1: Using the Web Interface (Easiest) ⭐

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** and go to:
   ```
   http://localhost:8080
   ```

3. **Log in** to your account (or create one if you haven't)

4. **Navigate to the Seed Data page**:
   - In the URL bar, type: `http://localhost:8080/seed-data`
   - OR click on the sidebar if there's a link (you may need to manually type the URL)

5. **Click the "Seed Database" button**

6. **Wait for success message** - You should see a toast notification saying:
   - "Successfully seeded database! Created 10 users, 5 groups, and X memberships"

7. **Now check your data**:
   - Go to **Discover People** page - Enter a prompt like "looking for hackathon teammates" and click "Find Matches"
   - Go to **Discover Groups** page - You should see 5 groups displayed

### Method 2: Using Command Line (Alternative)

If the web interface doesn't work, you can use the command line:

1. **Get your Supabase Service Role Key**:
   - Go to your Supabase Dashboard: https://supabase.com/dashboard
   - Select your project
   - Go to Settings → API
   - Copy the "service_role" key (NOT the anon key)

2. **Set environment variables** (in PowerShell):
   ```powershell
   $env:SUPABASE_URL="your_supabase_project_url"
   $env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   ```

3. **Run the seed script**:
   ```bash
   npm run seed
   ```

## Troubleshooting

### If you see "Function not found" error:
- The Supabase Edge Function might not be deployed
- You may need to deploy it manually or use Method 2 instead

### If you see "No matches found":
- Make sure you entered a prompt in the Discover People page
- Try prompts like:
  - "Looking for teammates for a hackathon project"
  - "Need study partners"
  - "Want to find friends who love gaming"

### If groups don't show:
- Make sure the seed script completed successfully
- Check the browser console for any errors
- Refresh the Discover Groups page

## What Gets Created

✅ **10 Sample Users**:
- Alex Chen (CS Junior) - Hackathon optimized 🎯
- Jordan Martinez (CS Sophomore) - Hackathon optimized 🎯
- Sam Taylor (Business Senior)
- Morgan Lee (Engineering Junior)
- Riley Johnson (Psychology Sophomore)
- Casey Williams (Music Senior)
- Taylor Brown (Mathematics Junior)
- Jamie Davis (Biology Sophomore)
- Quinn Anderson (Physics Senior)
- Avery Wilson (Economics Junior)

✅ **5 Sample Groups**:
- Hackathon Enthusiasts
- Study Group Central
- Gaming Squad
- Sports Fans United
- Music Lovers

✅ **Group Memberships** (users added to groups)

