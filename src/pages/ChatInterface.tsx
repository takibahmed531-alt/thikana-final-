import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  BadgeCheck,
  Send,
  Paperclip,
  Image as ImageIcon,
  ArrowLeft,
  MoreVertical,
  CheckCheck,
  ShieldCheck,
  Building2,
  Clock,
  ExternalLink,
  Lock,
  Loader2,
  Radio,
  Flag,
  Star,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReportModal from '../components/ReportModal';
import {
  subscribeToUserConversations,
  subscribeToMessages,
  sendMessage as sendFirebaseMessage,
  softDeleteConversation,
  toggleStarConversation,
  Conversation as LiveConversation,
  ChatMessage,
} from '../services/chatService';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
  imageUrl?: string;
}

interface Conversation {
  id: string;
  isLive?: boolean;
  propertyId?: string;
  user: {
    name: string;
    avatar: string;
    isVerified: boolean;
    role: string;
    online: boolean;
  };
  propertyTitle: string;
  propertyPrice: string;
  propertyLocation: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  deletedBy?: string[];
  starredBy?: string[];
}

const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    user: {
      name: 'Engr. Tariqul Islam',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      role: 'Landlord',
      online: true,
    },
    propertyTitle: 'Modern 3-BHK Flat with Rooftop Garden',
    propertyPrice: '৳36,000/mo',
    propertyLocation: 'Road 9A, Dhanmondi',
    lastMessage: 'Sure, you are welcome to visit tomorrow at 4:30 PM.',
    lastMessageTime: '10:42 AM',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        sender: 'other',
        text: 'Assalamu Alaikum! Thank you for showing interest in my 3-BHK flat on Road 9A, Dhanmondi.',
        timestamp: '10:30 AM',
      },
      {
        id: 'm2',
        sender: 'me',
        text: 'Walaikum Assalam Tariqul bhai. Is the flat available for immediate move-in? And is the gas line cylinder or government line?',
        timestamp: '10:33 AM',
      },
      {
        id: 'm3',
        sender: 'other',
        text: 'Yes, it is available from the 1st of next month. It has a continuous government pipeline gas supply, along with 24/7 generator backup.',
        timestamp: '10:36 AM',
      },
      {
        id: 'm4',
        sender: 'me',
        text: 'That sounds great! Can I schedule a physical viewing sometime this week?',
        timestamp: '10:40 AM',
      },
      {
        id: 'm5',
        sender: 'other',
        text: 'Sure, you are welcome to visit tomorrow at 4:30 PM. The caretaker will be at the gate to assist you.',
        timestamp: '10:42 AM',
      },
    ],
  },
  {
    id: 'c2',
    user: {
      name: 'Tanvir Hossain',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      role: 'Landlord',
      online: false,
    },
    propertyTitle: 'Furnished Bachelor Studio Unit',
    propertyPrice: '৳16,500/mo',
    propertyLocation: 'Block C, Banani',
    lastMessage: 'The WiFi router is 50 Mbps high-speed fiber.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'm201',
        sender: 'me',
        text: 'Hi Tanvir, is the bachelor studio suitable for 2 people or strictly single occupancy?',
        timestamp: 'Yesterday 3:15 PM',
      },
      {
        id: 'm202',
        sender: 'other',
        text: 'Hi! It is best suited for 1 person, but 2 bachelor students can share if comfortable.',
        timestamp: 'Yesterday 3:20 PM',
      },
      {
        id: 'm203',
        sender: 'other',
        text: 'The WiFi router is 50 Mbps high-speed fiber.',
        timestamp: 'Yesterday 3:21 PM',
      },
    ],
  },
  {
    id: 'c3',
    user: {
      name: 'Begum Rokeya',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      role: 'Landlord',
      online: true,
    },
    propertyTitle: 'Spacious Family Floor with Lift',
    propertyPrice: '৳45,000/mo',
    propertyLocation: 'Sector 11, Uttara',
    lastMessage: 'Yes, car parking spot #2 is included in this rent.',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm301',
        sender: 'me',
        text: 'Hello, is dedicated car parking included in the ৳45k rent?',
        timestamp: 'Sep 19, 11:00 AM',
      },
      {
        id: 'm302',
        sender: 'other',
        text: 'Yes, car parking spot #2 is included in this rent.',
        timestamp: 'Sep 19, 11:15 AM',
      },
    ],
  },
  {
    id: 'c4',
    user: {
      name: 'Arif Chowdhury',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      isVerified: false,
      role: 'Agent',
      online: false,
    },
    propertyTitle: 'Luxury 4-BHK South Facing Unit',
    propertyPrice: '৳52,000/mo',
    propertyLocation: 'Mirpur DOHS',
    lastMessage: 'I will send you photos of the master bathroom shortly.',
    lastMessageTime: 'Sep 18',
    unreadCount: 0,
    messages: [
      {
        id: 'm401',
        sender: 'other',
        text: 'I will send you photos of the master bathroom shortly.',
        timestamp: 'Sep 18, 4:00 PM',
      },
    ],
  },
];

export default function ChatInterface() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlChatId = searchParams.get('chatId');

  const [liveConversations, setLiveConversations] = useState<LiveConversation[]>([]);
  const [dummyConversations, setDummyConversations] = useState<Conversation[]>(DUMMY_CONVERSATIONS);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);

  const [activeChatId, setActiveChatId] = useState<string>(urlChatId || DUMMY_CONVERSATIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasInitializedActiveChat = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Listen to user state: if !user (user logs out), immediately clear activeChatId, liveConversations, and dummyConversations
  useEffect(() => {
    if (!user) {
      setActiveChatId('');
      setLiveConversations([]);
      setDummyConversations([]);
      hasInitializedActiveChat.current = false;
    } else {
      setDummyConversations((prev) => (prev.length === 0 ? DUMMY_CONVERSATIONS : prev));
    }
  }, [user]);

  // Subscribe to live conversations for current authenticated user
  useEffect(() => {
    if (!user?.uid) {
      setLiveConversations([]);
      return;
    }

    const unsubscribe = subscribeToUserConversations(
      user.uid,
      (convs) => {
        setLiveConversations(convs);
      },
      (err) => {
        console.warn('Real-time conversation subscription warning:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // Map live Firestore conversations to UI presentation format
  const mappedLiveConversations: Conversation[] = useMemo(() => {
    return liveConversations.map((liveConv) => {
      const isUserLandlord = user?.uid === liveConv.landlordUid;
      const role = isUserLandlord ? 'Tenant' : 'Landlord';
      const partnerName = isUserLandlord ? 'Prospective Tenant' : 'Landlord';

      let timeStr = 'Just now';
      if (liveConv.updatedAt?.toDate) {
        timeStr = liveConv.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (liveConv.updatedAt?.seconds) {
        timeStr = new Date(liveConv.updatedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return {
        id: liveConv.conversationId || liveConv.id || '',
        isLive: true,
        propertyId: liveConv.propertyId || 'prop-1',
        user: {
          name: partnerName,
          avatar:
            liveConv.propertyDetails?.imageUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          isVerified: true,
          role,
          online: true,
        },
        propertyTitle: liveConv.propertyDetails?.title || 'Rental Property Inquiry',
        propertyPrice: liveConv.propertyDetails?.rentAmount
          ? `৳${liveConv.propertyDetails.rentAmount.toLocaleString()}/mo`
          : '৳30,000/mo',
        propertyLocation: liveConv.propertyDetails?.location || 'Dhaka, Bangladesh',
        lastMessage: liveConv.lastMessage || 'Conversation started',
        lastMessageTime: timeStr,
        unreadCount: 0,
        messages: [],
        deletedBy: liveConv.deletedBy || [],
        starredBy: liveConv.starredBy || [],
      };
    });
  }, [liveConversations, user?.uid]);

  // Combine live conversations first, followed by dummyConversations: filter deletedBy and sort starredBy to top
  const allConversations: Conversation[] = useMemo(() => {
    const combined = [...mappedLiveConversations, ...dummyConversations];

    // Filter out conversations soft-deleted by current user
    const notDeleted = user?.uid
      ? combined.filter((c) => !c.deletedBy?.includes(user.uid))
      : combined;

    // Sort so that conversations starred by current user always appear at the top
    return notDeleted.sort((a, b) => {
      if (!user?.uid) return 0;
      const aStarred = a.starredBy?.includes(user.uid) ? 1 : 0;
      const bStarred = b.starredBy?.includes(user.uid) ? 1 : 0;
      return bStarred - aStarred;
    });
  }, [mappedLiveConversations, dummyConversations, user?.uid]);

  // Sync activeChatId when URL search param changes or active chat isn't initialized
  useEffect(() => {
    if (!user) return;
    if (urlChatId && allConversations.some((c) => c.id === urlChatId)) {
      setActiveChatId(urlChatId);
      hasInitializedActiveChat.current = true;
    } else if (!hasInitializedActiveChat.current && allConversations.length > 0) {
      setActiveChatId(allConversations[0].id);
      hasInitializedActiveChat.current = true;
    }
  }, [urlChatId, allConversations, user]);

  // Close options menu if active chat changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeChatId]);

  // Current active conversation
  const activeConversation = allConversations.find((c) => c.id === activeChatId);

  // Determine whether current active conversation is from Firestore live data
  const isLiveChat = Boolean(activeConversation?.isLive);

  const isCurrentStarred = Boolean(
    user?.uid && activeConversation?.starredBy?.includes(user.uid)
  );

  const handleToggleStar = async () => {
    if (!user || !activeConversation) return;
    setIsMenuOpen(false);
    const targetId = activeConversation.id;

    if (isLiveChat) {
      try {
        await toggleStarConversation(targetId, user.uid);
      } catch (err) {
        console.error('Error toggling star on conversation:', err);
      }
    } else {
      setDummyConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetId) {
            const starred = c.starredBy || [];
            const isStarred = starred.includes(user.uid);
            return {
              ...c,
              starredBy: isStarred
                ? starred.filter((u) => u !== user.uid)
                : [...starred, user.uid],
            };
          }
          return c;
        })
      );
    }
  };

  const handleDeleteConversation = async () => {
    if (!user || !activeConversation) return;
    setIsMenuOpen(false);
    const targetId = activeConversation.id;
    setActiveChatId('');
    setSearchParams({});

    if (isLiveChat) {
      try {
        await softDeleteConversation(targetId, user.uid);
      } catch (err) {
        console.error('Error soft-deleting conversation:', err);
      }
    } else {
      setDummyConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetId) {
            return {
              ...c,
              deletedBy: [...(c.deletedBy || []), user.uid],
            };
          }
          return c;
        })
      );
    }
  };

  // Subscribe to real-time messages when active conversation is a live Firebase conversation
  useEffect(() => {
    if (!activeChatId || !isLiveChat) {
      setLiveMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(
      activeChatId,
      (msgs: ChatMessage[]) => {
        const formatted: Message[] = msgs.map((m) => {
          let timeStr = 'Just now';
          if (m.createdAt?.toDate) {
            timeStr = m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (m.createdAt?.seconds) {
            timeStr = new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }

          return {
            id: m.messageId || m.id || `m_${Date.now()}_${Math.random()}`,
            sender: m.senderUid === user?.uid ? 'me' : 'other',
            text: m.text,
            timestamp: timeStr,
            imageUrl: m.imageUrl || undefined,
          };
        });
        setLiveMessages(formatted);
      },
      (err) => {
        console.warn('Real-time message subscription warning:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeChatId, isLiveChat, user?.uid]);

  // The active message feed to display: live messages if live chat, else local dummy messages
  const displayedMessages: Message[] = isLiveChat
    ? liveMessages
    : (activeConversation?.messages || []);

  // Auto-scroll message feed to bottom on new message or chat change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, displayedMessages.length]);

  // Filter conversations by landlord name or property title
  const filteredConversations = allConversations.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.propertyLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (id: string) => {
    setActiveChatId(id);
    setSearchParams({ chatId: id });
    // Mark dummy conversation as read if applicable
    setDummyConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!inputText.trim() && !attachedImage) return;

    const textToSend = inputText.trim();
    const imageToSend = attachedImage;
    setInputText('');
    setAttachedImage(null);

    if (isLiveChat) {
      setIsSending(true);
      try {
        await sendFirebaseMessage(activeChatId, user.uid, textToSend, imageToSend);
      } catch (err) {
        console.error('Failed to send live message:', err);
      } finally {
        setIsSending(false);
      }
    } else {
      // Dummy conversation: append to local dummy state
      const newMsg: Message = {
        id: `m_${Date.now()}`,
        sender: 'me',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: imageToSend || undefined,
      };

      setDummyConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId) {
            return {
              ...c,
              lastMessage: newMsg.text || 'Sent an image attachment',
              lastMessageTime: newMsg.timestamp,
              messages: [...c.messages, newMsg],
            };
          }
          return c;
        })
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAttachedImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
      {/* Outer Card Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[550px] max-h-[820px]">
        {/* ================================================== */}
        {/* Task 1: Split-Screen WhatsApp Web Layout           */}
        {/* Mobile: Switch between List and Active Chat        */}
        {/* Desktop (md+): 30% Left Sidebar, 70% Active Chat   */}
        {/* ================================================== */}
        <div className="flex-1 flex overflow-hidden">
          {/* ------------------------------------------------ */}
          {/* Left Sidebar: Recent Conversations List          */}
          {/* Visible on desktop OR on mobile when no chat open */}
          {/* ------------------------------------------------ */}
          <aside
            className={`w-full md:w-[32%] lg:w-[30%] min-w-[300px] border-r border-slate-200 flex flex-col bg-slate-50/60 ${
              activeChatId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200/80 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Messages</h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    Encrypted
                  </span>
                </div>
              </div>

              {/* Search Bar for Conversations */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search landlords or listings..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all border border-transparent focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Privacy Shield Banner */}
            <div className="px-4 py-2 bg-emerald-50/80 border-b border-emerald-100/80 flex items-center gap-2 text-[11px] text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Privacy mode: Phone numbers remain confidential.</span>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === activeChatId;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                          : 'hover:bg-slate-100/70 bg-white/50'
                      }`}
                    >
                      {/* Avatar with Online Dot */}
                      <div className="relative shrink-0">
                        <img
                          src={conv.user.avatar}
                          alt={conv.user.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                        {conv.user.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* Conversation Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-slate-900 text-sm truncate">
                              {conv.user.name}
                            </span>
                            {conv.user.isVerified && (
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            {conv.isLive && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Live
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {conv.lastMessageTime}
                          </span>
                        </div>

                        {/* Property Tag */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate mb-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{conv.propertyTitle}</span>
                          {user?.uid && conv.starredBy?.includes(user.uid) && (
                            <Star
                              className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0"
                              aria-label="Starred conversation"
                            />
                          )}
                        </div>

                        {/* Last Message Snippet & Unread Counter */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No conversations match your search.
                </div>
              )}
            </div>
          </aside>

          {/* ------------------------------------------------ */}
          {/* Right Column: Active Chat Window                 */}
          {/* Visible on desktop OR on mobile when chat open   */}
          {/* ------------------------------------------------ */}
          <main
            className={`w-full md:w-[68%] lg:w-[70%] flex flex-col bg-slate-50/50 ${
              activeChatId ? 'flex' : 'hidden md:flex'
            }`}
          >
            {activeConversation ? (
              <>
                {/* ---------------------------------------------------- */}
                {/* Task 2: Active Chat Sticky Header                    */}
                {/* ---------------------------------------------------- */}
                <header className="sticky top-0 z-10 px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button to return to list */}
                    <button
                      type="button"
                      onClick={() => setActiveChatId('')}
                      className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Landlord Avatar with verified indicator */}
                    <div className="relative shrink-0">
                      <img
                        src={activeConversation.user.avatar}
                        alt={activeConversation.user.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      {activeConversation.user.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Landlord Name & Status */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                          {activeConversation.user.name}
                        </h2>
                        {activeConversation.user.isVerified && (
                          <span
                            title="Verified Landlord Identity"
                            className="inline-flex items-center text-emerald-600"
                          >
                            <BadgeCheck className="w-4 h-4 fill-emerald-50" />
                          </span>
                        )}
                        {isCurrentStarred && (
                          <span title="Starred conversation" className="inline-flex items-center text-amber-500">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          </span>
                        )}
                        <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md">
                          {activeConversation.user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            activeConversation.user.online ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{activeConversation.user.online ? 'Online now' : 'Active today'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="truncate text-slate-600 font-medium">
                          {activeConversation.propertyLocation}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right Header Action: Property Pill */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/property/${activeConversation.propertyId || 'prop-1'}`}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate max-w-[150px]">
                        {activeConversation.propertyTitle}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsReportOpen(true)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Report this user or conversation"
                      aria-label="Report conversation"
                    >
                      <Flag className="w-4 h-4" />
                    </button>

                    {/* Actions Dropdown Menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        title="Conversation options"
                        aria-label="Conversation options"
                        aria-expanded={isMenuOpen}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          {/* Invisible Backdrop to close menu on outside click */}
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setIsMenuOpen(false)}
                          />

                          {/* Dropdown Menu */}
                          <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 divide-y divide-slate-100 text-xs">
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={handleToggleStar}
                                className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    isCurrentStarred
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-slate-400'
                                  }`}
                                />
                                <span>{isCurrentStarred ? 'Unstar Conversation' : 'Star / Unstar Conversation'}</span>
                              </button>
                            </div>

                            <div className="py-1">
                              <button
                                type="button"
                                onClick={handleDeleteConversation}
                                className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer font-medium"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                                <span>Delete Conversation</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </header>

                {/* Property Context Banner */}
                <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-slate-800">Inquiry for:</span>
                    <span className="truncate">{activeConversation.propertyTitle}</span>
                    <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {activeConversation.propertyPrice}
                    </span>
                  </div>
                  <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>In-App Privacy Protected</span>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* Task 3: Message Feed (Scrollable with Chat Bubbles)  */}
                {/* ---------------------------------------------------- */}
                <div
                  className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/70"
                  style={{
                    backgroundImage:
                      'radial-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  {/* Encryption & Safety Reminder Notice */}
                  <div className="max-w-md mx-auto my-2 text-center p-3 rounded-2xl bg-white/90 border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Thikana Trust & Privacy Shield</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Keep personal contact info and advance transactions within Thikana to stay protected from rental scams.
                    </p>
                  </div>

                  {/* Empty state for conversations with no messages yet */}
                  {displayedMessages.length === 0 && (
                    <div className="text-center py-10 px-4">
                      <p className="text-xs text-slate-400">
                        {isLiveChat
                          ? 'No messages yet in this inquiry. Send a message to start communicating!'
                          : 'No messages to display.'}
                      </p>
                    </div>
                  )}

                  {/* Messages Stream */}
                  {displayedMessages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-3.5 shadow-sm space-y-2 transition-all ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-none shadow-blue-500/10'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-slate-200/50'
                          }`}
                        >
                          {/* Attached Image Preview if available */}
                          {msg.imageUrl && (
                            <div className="rounded-xl overflow-hidden max-h-60 border border-white/20">
                              <img
                                src={msg.imageUrl}
                                alt="Shared attachment"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Message Text */}
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>

                          {/* Timestamp and Read Status */}
                          <div
                            className={`flex items-center justify-end gap-1 text-[10px] ${
                              isMe ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {/* Image Attachment Preview before sending */}
                {attachedImage && (
                  <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={attachedImage}
                        alt="Upload preview"
                        className="w-10 h-10 rounded-lg object-cover border border-slate-300"
                      />
                      <span className="text-xs text-slate-600 font-medium">Image attached</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Quick Icebreaker Inquiry Chips */}
                <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                  {[
                    'Is the flat still available?',
                    'Can I visit tomorrow at 4 PM?',
                    'Is parking included?',
                    'Can you share gas bill details?',
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!user}
                      onClick={() => {
                        if (!user) return;
                        setInputText(chip);
                      }}
                      className={`shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 transition-colors ${
                        !user ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* ---------------------------------------------------- */}
                {/* Task 4: Message Input Area (Sticky at Bottom)        */}
                {/* ---------------------------------------------------- */}
                <form
                  onSubmit={handleSendMessage}
                  className="sticky bottom-0 bg-white border-t border-slate-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
                >
                  {/* Hidden File Input for Image Attachments */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={!user}
                    className="hidden"
                  />

                  {/* Attachment Icon Button */}
                  <button
                    type="button"
                    disabled={!user}
                    onClick={() => {
                      if (!user) return;
                      fileInputRef.current?.click();
                    }}
                    className={`p-2.5 rounded-xl transition-all ${
                      !user
                        ? 'text-slate-300 cursor-not-allowed opacity-50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:scale-95'
                    }`}
                    title={!user ? 'Please sign in to attach files' : 'Attach Property Image or Document'}
                    aria-label="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {/* Text Input Field */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={!user}
                    placeholder={!user ? 'Please sign in to send messages...' : 'Type your message to landlord...'}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none transition-all border ${
                      !user
                        ? 'bg-slate-100 text-slate-400 placeholder-slate-400 cursor-not-allowed border-slate-200'
                        : 'bg-slate-100 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-600 border-transparent'
                    }`}
                  />

                  {/* Primary Send Button */}
                  <button
                    type="submit"
                    disabled={!user || (!inputText.trim() && !attachedImage) || isSending}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline text-xs">Send</span>
                  </button>
                </form>
              </>
            ) : (
              /* No Chat Selected Placeholder */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Select a conversation</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Choose an inquiry from the sidebar to coordinate viewing visits and ask landlords about rental terms.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Reusable Report & Fraud Detection Modal */}
      {activeConversation && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetId={activeConversation.user.name || activeConversation.id}
          targetType="user"
        />
      )}
    </div>
  );
}
