# Blendr

**A Smart Social Matching Platform Students**

Blendr is an innovative social networking platform designed exclusively for students to find teammates, study partners, friends, and hobby groups based on shared interests and intent-based matching.

---

## 🎯 Project Overview

Blendr connects students through an intelligent matching system that understands user intent. Whether you're looking for hackathon teammates, study partners, or friends with similar hobbies, Blendr's advanced algorithm finds the perfect matches.

### Key Features

- **Intent-Based Matching**: Users describe what they're looking for in natural language, and our algorithm finds compatible matches
- **Smart Profile Matching**: Combines tag similarity, profile attributes, and intent analysis
- **Group Discovery**: Find and join micro-communities based on interests
- **Real-time Messaging**: Connect with matched users instantly
- **Profile Customization**: Detailed profiles with interests, bio, and preferences

---

## 🧠 Matching Algorithm: IWJS-MB

**Intent-Weighted Jaccard Similarity with Multiplicative Boosting (IWJS-MB)**

Our proprietary matching algorithm combines multiple signals to find the best matches:

### Algorithm Components

1. **Tag-Based Similarity (Jaccard Coefficient)**
   - Calculates overlap between user interest tags
   - Formula: `(Common Tags / Total Unique Tags) × 100`

2. **Intent Analysis**
   - Analyzes user prompts to detect intent type:
     - **Teammate** (1.5x boost): hackathon, project, collaboration
     - **Study** (1.4x boost): homework, classes, academic
     - **Friend** (1.3x boost): social, hangout, chat
     - **Hobby** (1.35x boost): gaming, sports, music, fitness

3. **Keyword Matching**
   - Searches user profiles (bio, tags, looking_for) for intent keywords
   - Awards points for each matching keyword (+10 points)

4. **Attribute Bonuses**
   - Same major: +5 points
   - Same year: +5 points

5. **Multiplicative Boosting**
   - Applies intent-specific multipliers to final scores
   - Ensures relevant matches rank higher

### Mathematical Representation

```
M(u₁, u₂, I) = min(100, [(J(u₁.tags, u₂.tags) × 100 + B(u₁, u₂)) + K(u₂, I)] × M(I))
```

Where:
- `J` = Jaccard similarity coefficient
- `B` = Attribute bonus function (major, year)
- `K` = Keyword matching function
- `M` = Intent multiplier function
- `I` = User intent/prompt

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL database)
- **Supabase Auth** for authentication
- **Supabase Edge Functions** (Deno) for serverless functions
- **Row Level Security (RLS)** for data protection

### Key Libraries
- **@supabase/supabase-js** for database operations
- **Zod** for schema validation
- **Sonner** for toast notifications
- **React Hook Form** for form management

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd buckeye-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

   Get these from: Supabase Dashboard → Settings → API

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:8080
   ```

### Database Setup

The database schema is automatically created via Supabase migrations. Make sure your Supabase project is set up and migrations are applied.

---

## 📊 Demo Data

To populate the database with sample users and groups for demonstration:

### Option 1: Web Interface
1. Log in to the application
2. Navigate to `/seed-data` (or use the sidebar if available)
3. Click "Seed Database" button
4. This creates 5 sample groups immediately

### Option 2: Command Line (for users)
```bash
# Set environment variables
$env:SUPABASE_URL="your_supabase_url"
$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run seed script
npm run seed
```

This creates:
- **10 sample users** (including 2 CS students optimized for hackathon searches)
- **5 sample groups**
- **Group memberships**

See `QUICK_START_SEEDING.md` for detailed instructions.

---

## 🎬 Demo Walkthrough

### For Judges: Key Features to Showcase

1. **Intent-Based Matching** ⭐
   - Go to "Discover People"
   - Enter: "Looking for teammates for a hackathon project"
   - Show how Alex Chen and Jordan Martinez appear with high match scores
   - Explain the algorithm's intent detection

2. **Profile Discovery**
   - Show profile cards with match percentages
   - Highlight common interests
   - Demonstrate profile pictures and information

3. **Group Discovery**
   - Navigate to "Discover Groups"
   - Show 5 diverse groups
   - Demonstrate group joining functionality

4. **User Experience**
   - Show the clean, modern UI
   - Demonstrate responsive design
   - Highlight smooth animations and transitions

---

## 📁 Project Structure

```
buckeye-connect/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── AppLayout.tsx   # Main layout with sidebar
│   ├── pages/              # Page components
│   │   ├── DiscoverPeople.tsx    # Intent-based matching page
│   │   ├── DiscoverGroups.tsx    # Group discovery
│   │   ├── Dashboard.tsx         # User dashboard
│   │   ├── Messages.tsx          # Messaging interface
│   │   └── Profile.tsx          # User profile
│   ├── integrations/
│   │   └── supabase/       # Supabase client configuration
│   └── lib/                # Utility functions
├── supabase/
│   ├── functions/
│   │   ├── match-users/    # IWJS-MB matching algorithm
│   │   └── seed-data/      # Database seeding function
│   └── migrations/         # Database schema
└── scripts/
    └── seed-data.js        # Command-line seeding script
```

---

## 🔑 Key Algorithms & Features

### 1. Intent Analysis
- Natural language processing of user prompts
- Intent type classification (teammate, study, friend, hobby)
- Keyword extraction and matching

### 2. Similarity Calculation
- Jaccard similarity for tag overlap
- Weighted scoring with attribute bonuses
- Multiplicative boosting based on intent

### 3. Ranking & Filtering
- Score-based sorting (highest first)
- Zero-score filtering
- Result limiting and pagination ready

---

## 🎨 Design Philosophy

- **User-Centric**: Intent-based matching puts user needs first
- **Transparent**: Match scores and reasons are visible
- **Modern UI**: Clean, responsive design with smooth animations
- **Accessible**: Built with accessibility in mind using shadcn/ui

---

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Authentication** via Supabase Auth
- **Service Role Key** only used server-side
- **Input Validation** using Zod schemas

---

## 📈 Future Enhancements

Potential improvements for production:
- Machine learning integration for better matching
- Collaborative filtering
- Real-time notifications
- Advanced search filters
- Recommendation engine
- Analytics dashboard

---

## 👥 Team & Credits

**Blendr** - Built for students looking for connections

---

## 📝 License

This project is created for educational/demonstration purposes.

---

## 🆘 Support

For issues or questions:
- Check `QUICK_START_SEEDING.md` for seeding instructions
- Review `SEED_INSTRUCTIONS.md` for detailed setup
- Check browser console for error messages

---

## 🏆 Competition Highlights

### What Makes Blendr Stand Out

1. **Innovative Matching Algorithm**: IWJS-MB combines multiple signals for accurate matching
2. **Intent Understanding**: Natural language processing of user needs
3. **User Experience**: Modern, intuitive interface
4. **Scalable Architecture**: Built on Supabase for easy scaling
5. **Real-World Application**: Solves actual problem for students

---

**Built with ❤️ for Students**
