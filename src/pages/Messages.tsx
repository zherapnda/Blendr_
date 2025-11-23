import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Profile {
  id: string;
  name: string;
  major: string;
}

interface Conversation {
  userId: string;
  profile: Profile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user");
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(userId);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUser(user.id);
      await loadConversations(user.id);
      setLoading(false);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (selectedConversation && currentUser) {
      loadMessages(currentUser, selectedConversation);
      loadProfile(selectedConversation);
      markMessagesAsRead(currentUser, selectedConversation);
    }
  }, [selectedConversation, currentUser]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          // Update messages if in active conversation
          if (newMsg.sender_id === selectedConversation) {
            setMessages(prev => [...prev, newMsg]);
            markMessagesAsRead(currentUser, newMsg.sender_id);
          }
          
          // Reload conversations to update last message
          loadConversations(currentUser);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, selectedConversation]);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, major")
      .eq("id", userId)
      .single();
    
    if (data) setSelectedProfile(data);
  };

  const loadConversations = async (userId: string) => {
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!messagesData) return;

    // Group messages by conversation partner
    const conversationMap = new Map<string, Message[]>();
    messagesData.forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, []);
      }
      conversationMap.get(partnerId)!.push(msg);
    });

    // Get profiles for all conversation partners
    const partnerIds = Array.from(conversationMap.keys());
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, major")
      .in("id", partnerIds);

    if (!profiles) return;

    // Build conversations list
    const convos: Conversation[] = profiles.map(profile => {
      const msgs = conversationMap.get(profile.id) || [];
      const lastMsg = msgs[0];
      const unread = msgs.filter(m => m.receiver_id === userId && !m.read).length;

      return {
        userId: profile.id,
        profile,
        lastMessage: lastMsg?.content || "",
        lastMessageTime: lastMsg?.created_at || "",
        unreadCount: unread
      };
    });

    // Sort by last message time
    convos.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    setConversations(convos);
  };

  const loadMessages = async (userId: string, partnerId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const markMessagesAsRead = async (userId: string, partnerId: string) => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("receiver_id", userId)
      .eq("sender_id", partnerId)
      .eq("read", false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedConversation) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUser,
        receiver_id: selectedConversation,
        content: newMessage.trim()
      });

    if (error) {
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
    // Reload to show sent message
    await loadMessages(currentUser, selectedConversation);
    await loadConversations(currentUser);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-blue-900/10 pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}></div>
      {/* Conversations List */}
      <aside className="w-80 border-r border-border/30 flex flex-col relative z-10">
        <div className="p-6 border-b border-border/30">
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Messages
            </span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No conversations yet</p>
              <Button
                variant="outline"
                onClick={() => navigate("/discover-people")}
                className="hover:scale-105 transition-all"
              >
                Discover People
              </Button>
            </div>
          ) : (
            conversations.map(convo => (
              <button
                key={convo.userId}
                onClick={() => setSelectedConversation(convo.userId)}
                className={`w-full p-4 border-b border-border/30 hover:bg-card/50 transition-all text-left ${
                  selectedConversation === convo.userId ? "bg-card/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {convo.profile.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {convo.profile.name}
                      </h3>
                      {convo.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {convo.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col relative z-10">
        {selectedConversation && selectedProfile ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-border/30 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="hover:scale-105 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {selectedProfile.name[0]}
              </div>
              <div>
                <h2 className="font-bold text-foreground">{selectedProfile.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedProfile.major}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === currentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender_id === currentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-card/50 text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender_id === currentUser
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-border/30">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="bg-card/30 border-border/30"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-primary hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
