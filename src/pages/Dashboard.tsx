import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, MessageCircle, BookOpen, CheckCircle, Clock, Star, Calendar, MapPin, Users } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  major: string;
  year: string;
  tags: string[];
  bio: string;
}

interface Notification {
  id: string;
  type: 'message' | 'session' | 'connection' | 'reminder' | 'suggestion';
  text: string;
  time: string;
  icon: any;
  unread: boolean;
}

interface StudySession {
  id: string;
  name: string;
  date: string;
  location: string;
  attendees: number;
}

interface RecentConnection {
  id: string;
  name: string;
  initial: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const notifications: Notification[] = [
    { id: '1', type: 'message', text: 'Sarah Chen sent you a message', time: '10m ago', icon: MessageCircle, unread: true },
    { id: '2', type: 'session', text: 'New study session in CS 101', time: '1h ago', icon: BookOpen, unread: true },
    { id: '3', type: 'connection', text: 'Mike Johnson accepted your connection request', time: '3h ago', icon: CheckCircle, unread: false },
    { id: '4', type: 'reminder', text: 'Reminder: MATH 201 study session tomorrow at 7pm', time: '5h ago', icon: Clock, unread: false },
    { id: '5', type: 'suggestion', text: 'You have 3 new connection suggestions', time: '1d ago', icon: Star, unread: false },
  ];

  const upcomingSessions: StudySession[] = [
    { id: '1', name: 'CS 101 Study Group', date: 'Tomorrow at 7:00 PM', location: 'Library 3rd floor', attendees: 4 },
    { id: '2', name: 'MATH 201 Exam Prep', date: 'Friday at 3:00 PM', location: 'Student Center', attendees: 6 },
  ];

  const recentConnections: RecentConnection[] = [
    { id: '1', name: 'Sarah Chen', initial: 'S' },
    { id: '2', name: 'Mike Johnson', initial: 'M' },
    { id: '3', name: 'Emma Wilson', initial: 'E' },
    { id: '4', name: 'Alex Kim', initial: 'A' },
    { id: '5', name: 'Jamie Lee', initial: 'J' },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        } else {
          navigate("/profile-setup");
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-blue-900/10"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold font-heading mb-2">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Welcome back, {profile?.name?.split(" ")[0]}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">{profile?.major} • {profile?.year}</p>
        </div>

        {/* SECTION 1: Notifications */}
        <section className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            Notifications <Bell className="h-6 w-6" />
          </h2>
          <div className="space-y-3">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <Card
                  key={notification.id}
                  className="bg-[#2a2a2a] border-border/30 p-4 hover:bg-[#333333] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {notification.unread && (
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    )}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{notification.text}</p>
                      <p className="text-muted-foreground text-xs mt-1">{notification.time}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Quick Stats */}
        <section className="mb-8 animate-fade-in">
          <Card className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] border-2 border-transparent bg-clip-padding p-6 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-green-500/20 opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-white font-bold mb-4">Your Activity This Week</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">8</p>
                  <p className="text-muted-foreground text-sm">Messages Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">3</p>
                  <p className="text-muted-foreground text-sm">New Connections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">2</p>
                  <p className="text-muted-foreground text-sm">Sessions Attended</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* SECTION 3: Upcoming Study Sessions */}
        <section className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            Your Upcoming Sessions <Calendar className="h-6 w-6" />
          </h2>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <Card
                key={session.id}
                className="bg-[#2a2a2a] border-border/30 p-4 hover:bg-[#333333] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{session.name}</h3>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {session.date}
                      </p>
                      <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {session.location}
                      </p>
                      <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {session.attendees} people attending
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 4: Recent Connections */}
        <section className="mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-4">Recent Connections</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentConnections.map((connection) => (
              <div
                key={connection.id}
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate(`/messages?user=${connection.id}`)}
              >
                <Avatar className="h-[60px] w-[60px]">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                    {connection.initial}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white text-sm text-center">{connection.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;