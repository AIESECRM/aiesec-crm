"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  MessageCircle, X, Send, User as UserIcon, Check, CheckCheck, ArrowLeft, Search, MessageCirclePlus
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
  chapter?: string | null;
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
    // Veritabanından tüm kullanıcıları çekiyoruz
    const users = await getAllUsers();

    // Aktif kullanıcının (senin) rolü ve şubesi
    const userRole = currentUser?.role;
    const userChapter = currentUser?.chapter;

    // Sadece kendi şubesini görebilecek roller
    const restrictedRoles = ['TM', 'TL'];

    // Kullanıcıları filtrele
    const filteredUsers = users.filter((u: User) => {
      // 1. Kullanıcının kendisini sohbet listesinden çıkar
      if (u.id === parseInt(currentUser.id, 10)) return false;

      // 2. Eğer kullanıcının rolü TM veya TL ise, SADECE aynı şubedekileri göster
      if (restrictedRoles.includes(userRole)) {
        return u.chapter === userChapter;
      }

      // 3. Eğer rol kısıtlı değilse (LCVP, LCP, MCVP, MCP, ADMIN), herkesi göster
      return true;
    });

    // Filtrelenmiş listeyi ekrana basılmak üzere state'e kaydet
    setAllUsers(filteredUsers);
  };

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
        <div className="mb-4 w-[340px] sm:w-[380px] h-[550px] max-h-[calc(100vh-120px)] bg-background border border-border/50 shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">

          {/* HEADER SEKSİYONU - AIESEC Mavisi */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#037EF3] text-white shadow-md z-20">
            <div className="flex items-center gap-3">
              {view !== 'list' && (
                <button
                  onClick={() => setView('list')}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors -ml-2"
                >
                  <ArrowLeft size={20} />
                </button>
              )}

              {view === 'chat' && activePartner ? (
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={activePartner.image}
                    alt={activePartner.name}
                    size={36}
                    className="border border-white/30"
                    fallbackIcon={<span>{activePartner.name.charAt(0).toUpperCase()}</span>}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm leading-tight">{activePartner.name}</span>
                    <span className="text-[11px] text-white/80 leading-tight">{activePartner.role}</span>
                  </div>
                </div>
              ) : (
                <h3 className="font-semibold text-[17px] tracking-wide ml-1">
                  {view === 'list' && "Mesajlar"}
                  {view === 'new_chat' && "Yeni Sohbet Başlat"}
                </h3>
              )}
            </div>

            <div className="flex items-center gap-1">
              {view === 'list' && (
                <button
                  onClick={handleOpenNewChat}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Yeni Sohbet"
                >
                  <MessageCirclePlus size={20} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* İÇERİK SEKSİYONU */}
          <div className="flex-1 overflow-y-auto w-full h-full bg-slate-50 dark:bg-zinc-900/50">

            {/* 1. LİSTE GÖRÜNÜMÜ */}
            {view === 'list' && (
              <div className="flex flex-col p-2 gap-1">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full mt-20 text-muted-foreground p-6 text-center">
                    <div className="w-16 h-16 bg-[#037EF3]/10 text-[#037EF3] rounded-full flex items-center justify-center mb-4">
                      <MessageCircle size={32} />
                    </div>
                    <p className="font-medium text-foreground mb-1">Henüz mesajınız yok</p>
                    <p className="text-sm">Ekip üyeleriyle iletişime geçmek için yeni bir sohbet başlatın.</p>
                  </div>
                ) : (
                  conversations.map((conv: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPartner(conv.user)}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition-colors w-full text-left relative group"
                    >
                      <Avatar
                        src={conv.user.image}
                        alt={conv.user.name}
                        size={48}
                        className="shrink-0 shadow-sm"
                        fallbackIcon={<span>{conv.user.name.charAt(0).toUpperCase()}</span>}
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className="font-semibold text-[15px] truncate text-foreground group-hover:text-[#037EF3] transition-colors">{conv.user.name}</p>
                          <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className={`text-[13px] truncate pr-4 ${conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {conv.lastMessage.content}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute right-3 bottom-3 w-5 h-5 bg-[#037EF3] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                          {conv.unreadCount}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* 2. YENİ MESAJ GÖRÜNÜMÜ */}
            {view === 'new_chat' && (
              <div className="flex flex-col h-full">
                <div className="p-3 sticky top-0 z-10 bg-slate-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-border/50">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="İsim veya rol ile ara..."
                      className="w-full bg-background border border-border shadow-sm rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#037EF3]/50 transition-all"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="p-2 flex flex-col gap-1 overflow-y-auto">
                  {allUsers
                    .filter(u =>
                      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.role.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSelectPartner(u)}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/60 transition-colors w-full text-left"
                      >
                        <Avatar
                          src={u.image}
                          alt={u.name}
                          size={44}
                          className="shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-[14px] text-foreground">{u.name}</p>
                          <p className="text-[12px] text-muted-foreground">{u.role}</p>
                        </div>
                      </button>
                    ))}
                  {allUsers.filter(u =>
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.role.toLowerCase().includes(userSearch.toLowerCase())
                  ).length === 0 && (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        Aramanıza uygun kişi bulunamadı.
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* 3. SOHBET GÖRÜNÜMÜ */}
            {view === 'chat' && (
              <div className="flex flex-col p-4 gap-4">
                <div className="text-center mb-6 mt-4 flex flex-col items-center">
                  <Avatar
                    src={activePartner?.image}
                    alt={activePartner?.name}
                    size={72}
                    className="mb-3 shadow-md border-4 border-background"
                    fallbackIcon={<span className="text-2xl">{activePartner?.name.charAt(0).toUpperCase()}</span>}
                  />
                  <div className="font-bold text-lg text-foreground">{activePartner?.name}</div>
                  <div className="text-xs text-muted-foreground font-medium px-3 py-1 bg-muted rounded-full mt-2">
                    {activePartner?.role}
                  </div>
                </div>

                {messages.map((m, idx) => {
                  const isMe = m.senderId === parseInt(currentUser.id, 10);
                  return (
                    <div key={idx} className={`flex flex-col max-w-[85%] min-w-0 ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div
                        className={`px-5 py-3 shadow-sm relative overflow-hidden ${isMe
                            ? 'bg-[#037EF3] text-white rounded-2xl rounded-br-sm'
                            : 'bg-card border border-border/50 text-foreground rounded-2xl rounded-bl-sm'
                          }`}
                      >
                        <p className="text-[14px] leading-relaxed break-words break-all whitespace-pre-wrap">{m.content}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[10px] mt-1.5 px-1 ${isMe ? 'text-[#037EF3]' : 'text-muted-foreground'}`}>
                        <span className="text-muted-foreground">{formatTime(m.createdAt)}</span>
                        {isMe && (m.isRead ? <CheckCheck size={14} className="text-[#037EF3]" /> : <Check size={14} className="text-muted-foreground" />)}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            )}
          </div>

          {/* MESAJ YAZMA İNPUTU */}
          {view === 'chat' && (
            <div className="p-3 bg-background border-t border-border/50 z-10">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-muted/40 border border-border rounded-full pl-4 pr-1.5 py-1.5 focus-within:bg-background focus-within:border-[#037EF3]/40 focus-within:ring-4 focus-within:ring-[#037EF3]/10 transition-all shadow-sm"
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Bir mesaj yazın..."
                  className="flex-1 bg-transparent border-none py-1.5 text-[14px] focus:outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="w-9 h-9 shrink-0 bg-[#037EF3] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-muted-foreground transition-all hover:bg-blue-600 active:scale-95 shadow-sm"
                >
                  <Send size={16} className="ml-[2px]" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ANA TETİKLEYİCİ BUTON (YUVARLAK YÜZEN BUTON) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && view === 'new_chat') setView('list');
        }}
        className="w-14 h-14 bg-[#037EF3] text-white rounded-full shadow-[0_8px_30px_rgb(3,126,243,0.4)] flex items-center justify-center hover:scale-105 hover:bg-blue-600 active:scale-95 transition-all duration-300 relative focus:outline-none"
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'}`}>
          <MessageCircle size={28} />
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'}`}>
          <X size={28} />
        </div>

        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-background shadow-sm animate-bounce">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}
