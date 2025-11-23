import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Music } from "lucide-react";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").refine(
    (email) => email.endsWith("@.edu") || email.endsWith("@buckeyemail.edu"),
    "Must be an email (@.edu or @buckeyemail.edu)"
  ),
  major: z.string().min(1, "Major is required").max(100),
  year: z.enum(["Freshman", "Sophomore", "Junior", "Senior"], {
    errorMap: () => ({ message: "Please select your year" }),
  }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get("mode") === "signup");
  const [loading, setLoading] = useState(false);

  // Signup form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [password, setPassword] = useState("");

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = signupSchema.parse({ name, email, major, year, password });
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: validatedData.name,
            major: validatedData.major,
            year: validatedData.year,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Account created! Redirecting to profile setup...");
        navigate("/profile-setup");
      }
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = loginSchema.parse({ email, password });
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        {/* Back to Home Link */}
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </button>

        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
              <Music className="h-12 w-12 text-primary relative group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-foreground via-primary to-purple-400 bg-clip-text text-transparent">
            Blendr
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            {isSignup ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-8 border-2 border-border/50 shadow-2xl shadow-black/20 space-y-6">
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
            {isSignup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-semibold">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-all h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major" className="text-foreground font-semibold">Major</Label>
                  <Input
                    id="major"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Computer Science"
                    required
                    className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-all h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-foreground font-semibold">Year</Label>
                  <Select value={year} onValueChange={setYear} required>
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-all h-12 text-base">
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
                      <SelectItem value="Freshman">Freshman</SelectItem>
                      <SelectItem value="Sophomore">Sophomore</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name.123@.edu"
                required
                className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-all h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? "Min. 6 characters" : "Enter your password"}
                required
                className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-all h-12 text-base"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 bg-gradient-to-r from-primary to-emerald-500 hover:from-emerald-500 hover:to-primary hover:scale-105 transition-all duration-300" 
              disabled={loading}
            >
              {loading ? "Loading..." : isSignup ? "Create Account" : "Log In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary hover:text-emerald-400 font-semibold transition-colors hover:underline"
            >
              {isSignup ? "Log In" : "Sign Up"}
            </button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center text-xs text-muted-foreground">
          <p>🔒 Secure authentication • students only</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;