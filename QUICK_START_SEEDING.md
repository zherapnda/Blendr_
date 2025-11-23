# Quick Start: Seeding Your Database

## ✅ Step 1: Create Groups (Easy - Works Now!)

1. **Start your dev server**: `npm run dev`
2. **Log in** to your app
3. **Click "Seed Data"** in the sidebar (bottom)
4. **Click "Seed Database"** button
5. **Groups will be created!** ✅ You should see 5 groups in "Discover Groups"

## ✅ Step 2: Create Users (Requires Command Line)

Since creating users requires admin access, use the command line:

### Option A: Using PowerShell (Windows)

1. **Get your Supabase credentials**:
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Go to **Settings → API**
   - Copy:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **service_role** key (NOT the anon key - scroll down to find it)

2. **Open PowerShell** in your project directory

3. **Set environment variables**:
   ```powershell
   $env:SUPABASE_URL="https://your-project-id.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```

4. **Run the seed script**:
   ```powershell
   npm run seed
   ```

5. **You should see output like**:
   ```
   🌱 Starting database seeding...
   📝 Creating users and profiles...
   ✅ Created profile for Alex Chen (Computer Science)
   ✅ Created profile for Jordan Martinez (Computer Science)
   ...
   ✅ Created 10 users and profiles
   👥 Creating groups...
   ✅ Created 5 groups
   ```

### Option B: Using Command Prompt (Windows)

1. **Get your Supabase credentials** (same as above)

2. **Open Command Prompt** in your project directory

3. **Set environment variables**:
   ```cmd
   set SUPABASE_URL=https://your-project-id.supabase.co
   set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

4. **Run the seed script**:
   ```cmd
   npm run seed
   ```

## ✅ Step 3: Verify It Worked!

1. **Check Groups**:
   - Go to "Discover Groups" page
   - You should see 5 groups with profile pictures

2. **Check People**:
   - Go to "Discover People" page
   - Enter a prompt: **"Looking for teammates for a hackathon project"**
   - Click "Find Matches"
   - You should see **10 people** with profile pictures and match scores
   - **Alex Chen** and **Jordan Martinez** should have high match scores! 🎯

## Troubleshooting

### "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
- Make sure you set both environment variables
- Check that you copied the **service_role** key (not the anon key)

### "Error creating user"
- Make sure you're using the **service_role** key (has admin permissions)
- Check that your Supabase project is active

### Groups created but no users
- This means the groups worked but users didn't
- Use the command line method to create users (Step 2)

### Still having issues?
- Check the browser console (F12) for errors
- Check the terminal/command line for error messages
- Make sure your `.env` file has the correct SupABASE_URL (if using Vite env vars)

## What Gets Created

✅ **10 Users**:
- Alex Chen (CS Junior) - Hackathon optimized 🎯
- Jordan Martinez (CS Sophomore) - Hackathon optimized 🎯
- 8 other diverse users

✅ **5 Groups**:
- Hackathon Enthusiasts
- Study Group Central
- Gaming Squad
- Sports Fans United
- Music Lovers

✅ **Group Memberships** (users added to groups)

