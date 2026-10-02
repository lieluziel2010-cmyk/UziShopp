import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  ArrowRight,
  Send, 
  ShieldCheck, 
  MessageSquare, 
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ChatView: React.FC = () => {
  const { 
    chats, 
    activeChatThreadId, 
    openChatThread, 
    closeChatThread, 
    sendMessage, 
    currentUser, 
    users, 
    items,
    setSelectedItemForDetail,
    navigateToShop,
    openAuthModal,
    dir,
    t
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    t.chat.quick1,
    t.chat.quick2,
    t.chat.quick3,
    t.chat.quick4,
    t.chat.quick5,
  ];

  const activeThread = chats.find(c => c.id === activeChatThreadId);
  const otherUserId = activeThread?.participantIds.find(id => id !== currentUser?.id);
  const otherUser = users.find(u => u.id === otherUserId);
  const referencedItem = items.find(i => i.id === activeThread?.referencedItemId);

  useEffect(() => {
    if (activeThread) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !activeThread) return;
    sendMessage(activeThread.id, text.trim(), referencedItem?.id);
    setInputMessage('');
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  if (!currentUser) {
    return (
      <div dir={dir} className="bg-white rounded-3xl p-8 border border-purple-100 shadow-[0_8px_30px_rgba(168,85,247,0.06)] text-center my-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{t.chat.loginRequiredTitle}</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {t.chat.loginRequiredDesc}
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="py-3 px-6 bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 hover:opacity-95 text-white rounded-full text-xs font-bold shadow-md shadow-purple-500/25 transition-all active:scale-98 cursor-pointer"
        >
          {t.chat.loginBtn}
        </button>
      </div>
    );
  }

  // Active Chat Thread View
  if (activeThread && otherUser) {
    return (
      <div dir={dir} className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        {/* Thread Header */}
        <div className="p-3.5 bg-white border-b border-purple-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={closeChatThread}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              aria-label="חזרה"
            >
              <BackIcon className="w-4 h-4" />
            </button>
            
            <div 
              onClick={() => navigateToShop(otherUser.id)}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.username}
                  className="w-10 h-10 rounded-full object-cover border border-purple-100 shadow-2xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 text-purple-900 flex items-center justify-center font-bold text-sm border border-purple-100 shadow-2xs">
                  {otherUser.username[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-start">
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  {otherUser.shopName}
                </h3>
                <span className="text-[10px] text-slate-500">
                  @{otherUser.username}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigateToShop(otherUser.id)}
            className="text-[11px] text-purple-700 font-bold px-3 py-1 bg-purple-50 border border-purple-200 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
          >
            {t.chat.visitShop}
          </button>
        </div>

        {/* Referenced Item Banner */}
        {referencedItem && (
          <div 
            onClick={() => setSelectedItemForDetail(referencedItem)}
            className="p-2.5 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between gap-3 cursor-pointer hover:bg-purple-50 transition-colors shrink-0 text-start"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={referencedItem.imageUrl}
                alt={referencedItem.title}
                className="w-10 h-10 rounded-2xl object-cover shrink-0 border border-purple-100"
              />
              <div className="min-w-0">
                <span className="text-[10px] text-purple-700 font-bold block">
                  {t.chat.itemReferenceLabel}
                </span>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {referencedItem.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-950 tabular-nums">
                ₪{referencedItem.price}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
        )}

        {/* Peer to Peer Safety Banner */}
        <div className="p-2 bg-sky-50/70 border-b border-sky-100 text-center shrink-0">
          <p className="text-[11px] text-sky-900 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>{t.chat.safetyNotice}</span>
          </p>
        </div>

        {/* Message Bubble Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {activeThread.messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const timeFormatted = new Date(msg.timestamp).toLocaleTimeString(dir === 'rtl' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-3xl text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-900 border border-purple-100 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{timeFormatted}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-purple-600" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies Bar */}
        <div className="px-3 py-2 bg-white border-t border-purple-50 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSend(reply)}
              className="text-[11px] px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full whitespace-nowrap transition-colors shrink-0 border border-purple-200 cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Message Input Form */}
        <div className="p-3 bg-white border-t border-purple-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={t.chat.inputPlaceholder}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 py-2.5 px-4 bg-slate-50 border border-purple-100 rounded-full text-xs focus:outline-hidden focus:border-purple-600"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-2xs cursor-pointer"
              aria-label="שלח"
            >
              <Send className={`w-4 h-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Inbox View
  return (
    <div dir={dir} className="space-y-4 pb-20 text-start">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t.chat.inboxTitle}</h2>
          <p className="text-xs text-slate-500">{t.chat.inboxSubtitle}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center text-xs font-bold border border-purple-100">
          {chats.length}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 flex items-center gap-2 text-xs text-sky-900">
        <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
        <p>{t.chat.safetyNotice}</p>
      </div>

      {/* Conversations List */}
      {chats.length > 0 ? (
        <div className="space-y-2">
          {chats.map((thread) => {
            const partnerId = thread.participantIds.find(id => id !== currentUser.id);
            const partner = users.find(u => u.id === partnerId);
            const refItem = items.find(i => i.id === thread.referencedItemId);
            const timeFormatted = new Date(thread.lastMessageTime).toLocaleTimeString(dir === 'rtl' ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={thread.id}
                onClick={() => openChatThread(thread.id)}
                className="p-3.5 bg-white rounded-3xl border border-purple-100 hover:border-purple-300 shadow-2xs transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {partner?.avatar ? (
                      <img
                        src={partner.avatar}
                        alt={partner.username}
                        className="w-12 h-12 rounded-full object-cover border border-purple-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-200 via-purple-200 to-sky-200 text-purple-900 flex items-center justify-center font-bold text-base border border-purple-100 shadow-2xs">
                        {partner?.username[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    {thread.unreadCount && thread.unreadCount > 0 ? (
                      <span className="absolute -top-1 -end-1 w-3.5 h-3.5 bg-pink-500 rounded-full border-2 border-white" />
                    ) : null}
                  </div>

                  <div className="min-w-0 text-start">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {partner?.shopName || `@${partner?.username || 'user'}`}
                      </h4>
                      {refItem && (
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full truncate max-w-[120px] font-medium border border-purple-100">
                          {refItem.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {thread.lastMessage || '...'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {timeFormatted}
                  </span>
                  {refItem && (
                    <img
                      src={refItem.imageUrl}
                      alt={refItem.title}
                      className="w-7 h-7 rounded-xl object-cover border border-purple-100"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-purple-100 text-center my-6 space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t.chat.emptyInboxTitle}</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {t.chat.emptyInboxDesc}
          </p>
        </div>
      )}
    </div>
  );
};
