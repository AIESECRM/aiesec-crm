"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  MessageCircle, X, Send, User as UserIcon, Check, CheckCheck, ArrowLeft, Search 
} from "lucide-react";
import { 
  getRecentConversations, 
  getMessages, 
  sendMessage, 
  markAsRead, 
  getUnreadMessageCount 
} from "@/actions/message";
import { getAllUsers } from "@/actions/users";
import Avatar from "@/components/common/Avatar";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: number;
};

export default function ChatWidget() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;

  const [isOpen, setIsOpen] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  const [view, setView] = useState<'list' | 'chat' | 'new_chat'>('list');
  const [conversations, setConversations] = useState<any[]>([]);
  
  const [activePartner, setActivePartner] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchCounts = async () => {
      try {
          if (!isOpen) {
            const count = await getUnreadMessageCount(parseInt(currentUser.id, 10));
            setTotalUnread(count);
          } else {
            if (view === 'list') {
              const convs = await getRecentConversations(parseInt(currentUser.id, 10));
              setConversations(convs);
              const total = convs.reduce((acc, c) => acc + c.unreadCount, 0);
              setTotalUnread(total);
            } else if (view === 'chat' && activePartner) {
              const fetchedMessages = await getMessages(parseInt(currentUser.id, 10), activePartner.id);
              
              // Only update state if there are changes to avoid scroll jumps
              if (JSON.stringify(fetchedMessages) !== JSON.stringify(messages)) {
                setMessages(fetchedMessages);
              }

              const unreadMsgs = (fetchedMessages as Message[]).filter((m: Message) => m.receiverId === parseInt(currentUser.id, 10) && !m.isRead);
              if (unreadMsgs.length > 0) {
                await markAsRead(parseInt(currentUser.id, 10), activePartner.id);
              }
            }
          }
      } catch (err) {
          console.error("Chat fetch err:", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 3000);
    return () => clearInterval(interval);
  }, [currentUser?.id, isOpen, view, activePartner, messages]);

  useEffect(() => {
    if (view === 'chat') {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view]);

  const loadAllUsers = async () => {
    const users = await getAllUsers();
    setAllUsers(users.filter(u => u.id !== parseInt(currentUser.id, 10)));
  }

  const handleOpenNewChat = () => {
    loadAllUsers();
    setUserSearch("");
    setView('new_chat');
  };

  const handleSelectPartner = async (partner: User) => {
    setActivePartner(partner);
    setView('chat');
    const msgs = await getMessages(parseInt(currentUser.id, 10), partner.id);
    setMessages(msgs);
    await markAsRead(parseInt(currentUser.id, 10), partner.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activePartner || !currentUser?.id) return;

    const tempMsg = {
        id: Date.now(),
        senderId: parseInt(currentUser.id, 10),
        receiverId: activePartner.id,
        content: messageText,
        isRead: false,
        createdAt: Math.floor(Date.now() / 1000)
    };
    setMessages(prev => [...prev, tempMsg]);
    setMessageText("");

    await sendMessage(parseInt(currentUser.id, 10), activePartner.id, tempMsg.content);
    const msgs = await getMessages(parseInt(currentUser.id, 10), activePartner.id);
    setMessages(msgs);
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser?.id) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 max-h-[500px] h-[500px] bg-background border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              {view !== 'list' && (
                <button onClick={() => setView('list')} className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                  <ArrowLeft size={18} />
                </button>
              )}
              <h3 className="font-semibold text-foreground">
                {view === 'list' && "Mesajlar"}
                {view === 'new_chat' && "Yeni Mesaj"}
                {view === 'chat' && activePartner?.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {view === 'list' && (
                <button onClick={handleOpenNewChat} className="text-sm font-medium text-primary hover:underline px-2 py-1">
                  Yeni Sohbet
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full h-full bg-muted/20">
            {view === 'list' && (
              <div className="flex flex-col">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground mt-4">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    Henüz mesajınız yok. Yeni bir sohbete başlamak için yukardan "Yeni Sohbet"e tıklayın.
                  </div>
                ) : (
                  conversations.map((conv: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPartner(conv.user)}
                      className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 w-full text-left transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar 
                          src={conv.user.image} 
                          alt={conv.user.name} 
                          size={40} 
                          className="shrink-0"
                          fallbackIcon={<span>{conv.user.name.charAt(0).toUpperCase()}</span>}
                        />
                        <div className="overflow-hidden">
                          <p className="font-medium text-sm truncate">{conv.user.name}</p>
                          <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {conv.lastMessage.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[10px] text-muted-foreground mb-1">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                        {conv.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {view === 'new_chat' && (
              <div className="flex flex-col">
                <div className="p-3 border-b border-border bg-card/50 sticky top-0 z-10">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Kişi veya rol ara..."
                      className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                      autoFocus
                    />
                  </div>
                </div>
                {allUsers
                  .filter(u => 
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                    u.role.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectPartner(u)}
                      className="flex items-center gap-3 p-4 border-b border-border hover:bg-muted/50 w-full text-left transition-colors"
                    >
                      <Avatar 
                        src={u.image} 
                        alt={u.name} 
                        size={40} 
                        className="shrink-0"
                      />
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.role}</p>
                      </div>
                    </button>
                  ))}
                {allUsers.filter(u => 
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                    u.role.toLowerCase().includes(userSearch.toLowerCase())
                  ).length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Kişi bulunamadı.
                  </div>
                )}
              </div>
            )}

            {view === 'chat' && (
              <div className="flex flex-col p-4 gap-4">
                <div className="text-center mb-4 flex flex-col items-center">
                    <Avatar 
                      src={activePartner?.image} 
                      alt={activePartner?.name} 
                      size={64} 
                      className="mb-2 border-2 border-primary/20"
                      fallbackIcon={<span>{activePartner?.name.charAt(0).toUpperCase()}</span>}
                    />
                    <div className="font-semibold text-foreground">{activePartner?.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Sohbet Başlatıldı</div>
                </div>
                {messages.map((m, idx) => {
                  const isMe = m.senderId === parseInt(currentUser.id, 10);
                  return (
                    <div key={idx} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                      <div 
                        className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          isMe 
                            ? 'bg-[#037EF3] text-white rounded-br-none' 
                            : 'bg-card border border-border text-card-foreground rounded-bl-none'
                        }`}
                      >
                        <p className="text-[13.5px] leading-relaxed break-words whitespace-pre-wrap font-medium">{m.content}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[9px] text-muted-foreground mt-1 px-1 ${isMe ? 'self-end' : 'self-start'}`}>
                        <span>{formatTime(m.createdAt)}</span>
                        {isMe && (m.isRead ? <CheckCheck size={12} className="text-sky-500" /> : <Check size={12} />)}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {view === 'chat' && (
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl pr-1.5 pl-3 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 bg-transparent border-none py-3 text-sm focus:outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="w-9 h-9 bg-[#037EF3] text-white rounded-lg flex items-center justify-center disabled:opacity-50 transition-all hover:bg-[#0266c8] active:scale-95 shadow-md"
                >
                  <Send size={16} style={{marginLeft: "2px"}} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && view === 'new_chat') setView('list');
        }}
        className="w-14 h-14 bg-[#037EF3] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300 relative focus:outline-none border-2 border-white/10"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={28} className="mt-[2px]" />}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center border-2 border-background animate-pulse">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}
