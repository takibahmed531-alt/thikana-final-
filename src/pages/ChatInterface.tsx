import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  BadgeCheck,
  Send,
  Paperclip,
  ArrowLeft,
  MoreVertical,
  Check,
  CheckCheck,
  ShieldCheck,
  ShieldAlert,
  Building2,
  ExternalLink,
  Lock,
  Loader2,
  Flag,
  Star,
  Trash2,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ReportModal from '../components/ReportModal';
import {
  subscribeToUserConversations,
  subscribeToMessages,
  sendMessage as sendFirebaseMessage,
  startConversationAndSendMessage,
  softDeleteConversation,
  toggleStarConversation,
  uploadChatImage,
  Conversation as LiveConversation,
  ChatMessage,
  PropertySummary,
} from '../services/chatService';
import { getPropertyById } from '../services/propertyService';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
  imageUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
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

export default function ChatInterface() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlChatId = searchParams.get('chatId');
  const newPropertyId = searchParams.get('newPropertyId') || searchParams.get('propertyId');
  const landlordUid = searchParams.get('landlordUid');

  const [liveConversations, setLiveConversations] = useState<LiveConversation[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, { name: string; avatar: string }>>({});
  const [draftConversation, setDraftConversation] = useState<Conversation | null>(null);
  const [draftPropertyRaw, setDraftPropertyRaw] = useState<any>(null);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isConversationsLoaded, setIsConversationsLoaded] = useState(false);

  const [activeChatId, setActiveChatId] = useState<string>(urlChatId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasInitializedActiveChat = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Listen to user state: if !user (user logs out), immediately clear activeChatId and liveConversations
  useEffect(() => {
    if (!user) {
      setActiveChatId('');
      setLiveConversations([]);
      setDraftConversation(null);
      setPartnerProfiles({});
      setIsConversationsLoaded(false);
      hasInitializedActiveChat.current = false;
    }
  }, [user]);

  // Subscribe to live conversations for current authenticated user
  useEffect(() => {
    if (!user?.uid) {
      setLiveConversations([]);
      setIsConversationsLoaded(false);
      return;
    }

    const unsubscribe = subscribeToUserConversations(
      user.uid,
      (convs) => {
        setLiveConversations(convs);
        setIsConversationsLoaded(true);
      },
      (err) => {
        console.warn('Real-time conversation subscription warning:', err);
        setIsConversationsLoaded(true);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // Fetch public profiles for chat partners to display real display names and avatars
  useEffect(() => {
    if (!user?.uid || liveConversations.length === 0) return;

    const fetchPartnerProfiles = async () => {
      const updates: Record<string, { name: string; avatar: string }> = {};

      for (const liveConv of liveConversations) {
        const partnerUid =
          liveConv.landlordUid === user.uid
            ? liveConv.tenantUid
            : liveConv.landlordUid;

        if (partnerUid && !partnerProfiles[partnerUid] && !updates[partnerUid]) {
          try {
            const profileSnap = await getDoc(doc(db, 'publicProfiles', partnerUid));
            if (profileSnap.exists()) {
              const data = profileSnap.data();
              if (data?.displayName || data?.photoURL) {
                updates[partnerUid] = {
                  name: data.displayName || '',
                  avatar: data.photoURL || '',
                };
              }
            }
          } catch (err) {
            console.warn(`Could not fetch public profile for ${partnerUid}:`, err);
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        setPartnerProfiles((prev) => ({ ...prev, ...updates }));
      }
    };

    fetchPartnerProfiles();
  }, [liveConversations, user?.uid]);

  // Handle direct navigation with newPropertyId and landlordUid
  useEffect(() => {
    if (!user || !newPropertyId) return;

    const targetLandlordUid = landlordUid || 'landlord_demo_host';

    // 1. Check if an existing live conversation already matches this property and landlord
    const existingLive = liveConversations.find(
      (c) =>
        c.propertyId === newPropertyId &&
        (c.landlordUid === targetLandlordUid ||
          c.tenantUid === targetLandlordUid ||
          c.participants?.includes(targetLandlordUid))
    );

    if (existingLive) {
      const liveId = existingLive.conversationId || existingLive.id || '';
      setActiveChatId(liveId);
      setDraftConversation(null);
      hasInitializedActiveChat.current = true;
      return;
    }

    // 2. No live conversation exists yet: prepare an active draft conversation UI
    const draftId = `draft_${newPropertyId}_${targetLandlordUid}`;

    const initialDraft: Conversation = {
      id: draftId,
      isLive: true,
      propertyId: newPropertyId,
      user: {
        name: 'Property Landlord',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
        role: 'Landlord',
        online: true,
      },
      propertyTitle: 'Property Inquiry',
      propertyPrice: '৳30,000/mo',
      propertyLocation: 'Dhaka, Bangladesh',
      lastMessage: 'New inquiry — send a message to start conversation',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: [],
    };

    setDraftConversation(initialDraft);
    setActiveChatId(draftId);
    hasInitializedActiveChat.current = true;

    // Fetch real property details from Firestore to populate title, price, location, and photos
    getPropertyById(newPropertyId)
      .then((res) => {
        if (res.success && res.property) {
          const prop = res.property;
          setDraftPropertyRaw(prop);
          setDraftConversation((prev) => {
            if (!prev || prev.id !== draftId) return prev;
            return {
              ...prev,
              propertyTitle: prop.title || prev.propertyTitle,
              propertyPrice: prop.rentAmount
                ? `৳${prop.rentAmount.toLocaleString()}/mo`
                : prev.propertyPrice,
              propertyLocation: prop.location || prev.propertyLocation,
              user: {
                ...prev.user,
                name: (prop as any).landlord?.name || 'Landlord',
                avatar: prop.images?.[0] || prev.user.avatar,
              },
            };
          });
        }
      })
      .catch((err) => {
        console.warn('Property lookup for draft chat notice:', err);
      });
  }, [newPropertyId, landlordUid, liveConversations, user]);

  // Mark conversations as read when user opens and receives liveConversations
  useEffect(() => {
    localStorage.setItem('lastSeenChatTime', Date.now().toString());
  }, [liveConversations]);

  // Map live Firestore conversations to UI presentation format
  const mappedLiveConversations: Conversation[] = useMemo(() => {
    return liveConversations.map((liveConv) => {
      const isUserLandlord = user?.uid === liveConv.landlordUid;
      const role = isUserLandlord ? 'Tenant' : 'Landlord';
      const partnerUid =
        liveConv.landlordUid === user?.uid
          ? liveConv.tenantUid
          : liveConv.landlordUid;
      const partnerName =
        (partnerUid && partnerProfiles[partnerUid]?.name) ||
        (isUserLandlord ? 'Tenant' : 'Landlord');

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
            (partnerUid && partnerProfiles[partnerUid]?.avatar) ||
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
  }, [liveConversations, user?.uid, partnerProfiles]);

  // Combine live conversations and active draft conversation: filter deletedBy and sort starredBy to top
  const allConversations: Conversation[] = useMemo(() => {
    let combined = [...mappedLiveConversations];

    // Prepend active draft conversation if not already represented in live conversations
    if (
      draftConversation &&
      !mappedLiveConversations.some((c) => c.id === draftConversation.id || (draftConversation.propertyId && c.propertyId === draftConversation.propertyId))
    ) {
      combined = [draftConversation, ...combined];
    }

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
  }, [mappedLiveConversations, draftConversation, user?.uid]);

  // Sync activeChatId when URL search param changes or active chat isn't initialized
  useEffect(() => {
    if (!user) return;

    if (urlChatId) {
      if (!isConversationsLoaded) return;

      if (allConversations.some((c) => c.id === urlChatId)) {
        setActiveChatId(urlChatId);
        hasInitializedActiveChat.current = true;
      } else if (!hasInitializedActiveChat.current && allConversations.length > 0) {
        setActiveChatId(allConversations[0]?.id || '');
        hasInitializedActiveChat.current = true;
      }
    } else if (!newPropertyId && !hasInitializedActiveChat.current && allConversations.length > 0) {
      setActiveChatId(allConversations[0].id);
      hasInitializedActiveChat.current = true;
    }
  }, [urlChatId, newPropertyId, allConversations, isConversationsLoaded, user]);

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
            status: m.status || 'read',
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

  // The active message feed to display: live messages if live chat, else local messages
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
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!inputText.trim() && !attachedImage) return;

    const textToSend = inputText.trim();
    const imageToSend = attachedImage;
    setInputText('');
    setAttachedImage(null);

    // If sending in a draft conversation (initialized from newPropertyId / landlordUid)
    if (activeChatId.startsWith('draft_') || (draftConversation && activeChatId === draftConversation.id)) {
      setIsSending(true);
      try {
        const targetPropId = newPropertyId || draftConversation?.propertyId || 'prop-1';
        const targetLandlordUid = landlordUid || 'landlord_demo_host';
        const propSummary: PropertySummary = {
          propertyId: targetPropId,
          title: draftConversation?.propertyTitle || 'Property Inquiry',
          rentAmount: draftPropertyRaw?.rentAmount || 0,
          location: draftConversation?.propertyLocation || '',
          imageUrl: draftPropertyRaw?.images?.[0] || draftConversation?.user.avatar || '',
        };

        const res = await startConversationAndSendMessage(
          user.uid,
          targetLandlordUid,
          targetPropId,
          propSummary,
          textToSend || (imageToSend ? 'Sent an attachment' : '')
        );

        if (imageToSend && res?.conversationId) {
          await sendFirebaseMessage(res.conversationId, user.uid, '', imageToSend);
        }

        const newConvId = res.conversationId;
        setDraftConversation(null);
        setActiveChatId(newConvId);
        setSearchParams({ chatId: newConvId });
      } catch (err: any) {
        console.error('Failed to start conversation and send message:', err);
        alert(err?.message || 'Failed to send message. Please try again.');
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (isLiveChat) {
      setIsSending(true);
      try {
        await sendFirebaseMessage(activeChatId, user.uid, textToSend, imageToSend);
      } catch (err) {
        console.error('Failed to send live message:', err);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const downloadURL = await uploadChatImage(file);
      setAttachedImage(downloadURL);
    } catch (error: any) {
      console.error('Failed to compress and upload image:', error);
      alert('Failed to upload image. Please try again with a valid image file.');
    } finally {
      setIsUploadingImage(false);
      if (e.target) {
        e.target.value = '';
      }
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
                            {conv.id.startsWith('draft_') ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                New Inquiry
                              </span>
                            ) : conv.isLive ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Live
                              </span>
                            ) : null}
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
              activeChatId || (urlChatId && !isConversationsLoaded) ? 'flex' : 'hidden md:flex'
            }`}
          >
            {urlChatId && !isConversationsLoaded ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Loading conversation...</h3>
                <p className="text-xs text-slate-400">Connecting to secure messaging channel</p>
              </div>
            ) : activeConversation ? (
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

                {/* Security Warning Banner */}
                <div className="px-4 py-2.5 bg-amber-50/95 border-b border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900 shadow-2xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="leading-snug text-[11px] sm:text-xs">
                    For your security, NEVER send advance money or booking fees before physically visiting the property. Do not share OTPs. Keep all communication within Thikana.
                  </p>
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

                          {/* Timestamp and Delivery/Read Status Receipts */}
                          <div
                            className={`flex items-center justify-end gap-1 text-[10px] ${
                              isMe ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMe && (
                              <span
                                className="inline-flex items-center ml-0.5"
                                title={
                                  msg.status === 'read'
                                    ? 'Read'
                                    : msg.status === 'delivered'
                                    ? 'Delivered'
                                    : 'Sent'
                                }
                              >
                                {msg.status === 'read' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                                ) : msg.status === 'delivered' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-200/75" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-blue-200/75" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {/* Image Uploading Progress Indicator */}
                {isUploadingImage && (
                  <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                      <span className="font-medium">Compressing & uploading image to storage...</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold">Please wait</span>
                  </div>
                )}

                {/* Image Attachment Preview before sending */}
                {attachedImage && !isUploadingImage && (
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
                    disabled={!user || isUploadingImage}
                    className="hidden"
                  />

                  {/* Attachment Icon Button */}
                  <button
                    type="button"
                    disabled={!user || isUploadingImage}
                    onClick={() => {
                      if (!user || isUploadingImage) return;
                      fileInputRef.current?.click();
                    }}
                    className={`p-2.5 rounded-xl transition-all ${
                      !user || isUploadingImage
                        ? 'text-slate-300 cursor-not-allowed opacity-50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:scale-95 cursor-pointer'
                    }`}
                    title={
                      !user
                        ? 'Please sign in to attach files'
                        : isUploadingImage
                        ? 'Uploading image...'
                        : 'Attach Property Image or Document'
                    }
                    aria-label="Attach file"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    ) : (
                      <Paperclip className="w-5 h-5" />
                    )}
                  </button>

                  {/* Text Input Field */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={!user || isUploadingImage}
                    placeholder={
                      !user
                        ? 'Please sign in to send messages...'
                        : isUploadingImage
                        ? 'Uploading image attachment...'
                        : 'Type your message to landlord...'
                    }
                    className={`flex-1 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none transition-all border ${
                      !user || isUploadingImage
                        ? 'bg-slate-100 text-slate-400 placeholder-slate-400 cursor-not-allowed border-slate-200'
                        : 'bg-slate-100 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-600 border-transparent'
                    }`}
                  />

                  {/* Primary Send Button */}
                  <button
                    type="submit"
                    disabled={!user || (!inputText.trim() && !attachedImage) || isSending || isUploadingImage}
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
