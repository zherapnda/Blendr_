import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Music, Users, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-8 py-5 backdrop-blur-md bg-background/60 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 animate-fade-in group cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
              <Music className="h-9 w-9 text-primary relative group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-purple-400 transition-all duration-300">
              Blendr
            </h1>
          </div>
          <div className="flex gap-4 animate-fade-in">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")} 
              className="hover:scale-105 transition-all duration-300 hover:bg-white/10 backdrop-blur-sm font-semibold text-base"
            >
              Log In
            </Button>
            <Button 
              onClick={() => navigate("/auth?mode=signup")} 
              className="shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-emerald-500 hover:from-emerald-500 hover:to-primary font-bold text-base px-6"
            >
              Sign Up Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-8 py-20 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto text-center space-y-12 relative z-10">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 text-primary text-sm font-semibold mb-4 animate-scale-in backdrop-blur-sm">
                🎓 Exclusively for Students
              </span>
            </div>
            <h2 className="text-7xl md:text-8xl font-bold font-heading leading-tight">
              <span className="bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent animate-fade-in">
                Find your people
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-white bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.2s' }}>
                .
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              Connect with like-minded students who share your <span className="text-primary font-semibold">interests</span>. 
              Discover <span className="text-purple-400 font-semibold">micro-communities</span>, 
              join groups, and build <span className="text-blue-400 font-semibold">meaningful connections</span> around what you love.
            </p>
          </div>

          <div className="flex gap-6 justify-center pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?mode=signup")} 
              className="text-xl px-12 py-7 shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-110 transition-all duration-300 bg-gradient-to-r from-primary to-emerald-500 hover:from-emerald-500 hover:to-primary font-bold"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="text-xl px-12 py-7 hover:scale-110 transition-all duration-300 border-2 hover:bg-white/10 backdrop-blur-sm font-semibold"
            >
              Log In
            </Button>
          </div>

          {/* Feature Cards */}
          <div ref={featuresRef} className="grid md:grid-cols-3 gap-8 mt-32 pt-12">
            <div className={`relative bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 space-y-4 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/60 transition-all duration-500 hover:scale-110 hover:-translate-y-3 group cursor-pointer overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} transition-all duration-700`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/40 transition-all duration-500 scale-0 group-hover:scale-100"></div>
                <Users className="h-16 w-16 text-white mx-auto relative group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white group-hover:text-purple-100 transition-colors">Match with Students</h3>
              <p className="text-purple-100 leading-relaxed text-base">
                Find students with similar interests based on your tags and hobbies
              </p>
              <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-sm font-semibold flex items-center justify-center gap-2">
                  Explore matches <span className="group-hover:translate-x-2 transition-transform">→</span>
                </span>
              </div>
            </div>

            <div className={`relative bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 space-y-4 border-2 border-blue-500/30 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/60 transition-all duration-500 hover:scale-110 hover:-translate-y-3 group cursor-pointer overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} transition-all duration-700 delay-200`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/40 transition-all duration-500 scale-0 group-hover:scale-100"></div>
                <Sparkles className="h-16 w-16 text-white mx-auto relative group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white group-hover:text-blue-100 transition-colors">Discover Groups</h3>
              <p className="text-blue-100 leading-relaxed text-base">
                Join micro-communities around niche interests and activities
              </p>
              <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-sm font-semibold flex items-center justify-center gap-2">
                  Browse groups <span className="group-hover:translate-x-2 transition-transform">→</span>
                </span>
              </div>
            </div>

            <div className={`relative bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 space-y-4 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/60 transition-all duration-500 hover:scale-110 hover:-translate-y-3 group cursor-pointer overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} transition-all duration-700 delay-500`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/40 transition-all duration-500 scale-0 group-hover:scale-100"></div>
                <Music className="h-16 w-16 text-white mx-auto relative group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold font-heading text-white group-hover:text-emerald-100 transition-colors">Create Communities</h3>
              <p className="text-emerald-100 leading-relaxed text-base">
                Start your own group and connect with others who share your passion
              </p>
              <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-sm font-semibold flex items-center justify-center gap-2">
                  Start creating <span className="group-hover:translate-x-2 transition-transform">→</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-8 mt-12">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>© 2025 Blendr. Exclusively for students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;