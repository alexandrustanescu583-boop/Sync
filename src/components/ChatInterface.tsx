import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Volume,
  Copy,
  Check,
  CheckCircle,
  RotateCcw,
  Menu,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  AlertTriangle,
  LogOut,
  Clock,
  RotateCw,
  Square,
  Sparkles,
  BookOpen,
  PenTool,
  Code2,
  Image as ImageIcon,
  ExternalLink,
  Download,
  Maximize2,
  Gamepad2,
  Globe,
  X,
  Search,
  Sun,
  Moon,
} from 'lucide-react';
import {
  ChatSession,
  AssistantModeId,
  VerificationResult,
  UserRole,
  UserAccount,
} from '../types';
import { ASSISTANT_MODES } from '../data/modesData';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TwLogo, TwSparkleIcon } from './TwLogo';
import {
  speakMessage,
  stopSpeaking,
  VoiceDictation,
  isSpeechRecognitionSupported,
} from '../utils/speechUtils';

interface ChatInterfaceProps {
  session: ChatSession;
  onSendMessage: (content: string) => Promise<void>;
  onGenerateImage: (prompt: string) => Promise<void>;
  onRegenerateLast: () => Promise<void>;
  isLoading: boolean;
  onToggleSidebar: () => void;
  currentMode: AssistantModeId;
  onChangeMode: (mode: AssistantModeId) => void;
  onOpenAdmin: () => void;
  userRole: UserRole;
  speedPriority: boolean;
  onVerifyMessage: (messageId: string, question: string, answer: string) => Promise<void>;
  verifyingMessageId: string | null;
  currentUser: UserAccount;
  onLogout: () => void;
  onResetQuota: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  session,
  onSendMessage,
  onGenerateImage,
  onRegenerateLast,
  isLoading,
  onToggleSidebar,
  currentMode,
  onChangeMode,
  onOpenAdmin,
  userRole,
  onVerifyMessage,
  verifyingMessageId,
  currentUser,
  onLogout,
  onResetQuota,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [inputText, setInputText] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down'>>({});
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    return localStorage.getItem('tw_autospeak') === 'true';
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePromptModal, setShowImagePromptModal] = useState(false);
  const [imagePromptInput, setImagePromptInput] = useState('');

  const handleOpenImageModal = () => {
    if (inputText.trim()) {
      setImagePromptInput(inputText.trim());
    }
    setShowImagePromptModal(true);
  };

  const safeSession = session || {
    id: 'default-session',
    title: 'Conversație Nouă',
    mode: currentMode || 'general',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const messages = safeSession.messages || [];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dictationRef = useRef<VoiceDictation | null>(null);
  const wasLoadingRef = useRef(false);

  const activeMode =
    ASSISTANT_MODES.find((m) => m.id === currentMode) || ASSISTANT_MODES[0];

  const remainingMessages = Math.max(
    0,
    currentUser.maxDailyMessages - currentUser.dailyMessageCount
  );
  const isFounder = currentUser.role === 'fondator';
  const isPrivileged = isFounder || currentUser.role === 'superuser';
  const isQuotaExhausted = remainingMessages <= 0 && !isPrivileged;
  const isLastTwoWarning = !isPrivileged && remainingMessages <= 2 && remainingMessages > 0;

  useEffect(() => {
    localStorage.setItem('tw_autospeak', autoSpeak.toString());
  }, [autoSpeak]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading && autoSpeak) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content.trim()) {
        handleSpeak(lastMsg.id, lastMsg.content);
      }
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, autoSpeak, messages]);

  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      dictationRef.current = new VoiceDictation(
        (transcript) => {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsDictating(false);
        },
        () => {
          setIsDictating(false);
        }
      );
    }
    return () => {
      dictationRef.current?.stop();
    };
  }, []);

  const handleToggleDictation = () => {
    if (!dictationRef.current) return;
    if (isDictating) {
      dictationRef.current.stop();
      setIsDictating(false);
    } else {
      dictationRef.current.start();
      setIsDictating(true);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading || isQuotaExhausted) return;

    if (isDictating) {
      dictationRef.current?.stop();
      setIsDictating(false);
    }

    if (!customText) {
      setInputText('');
    }
    await onSendMessage(textToSend);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingMessageId === id) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(id);
      speakMessage(text, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  const handleRate = (id: string, rating: 'up' | 'down') => {
    setRatings((prev) => ({ ...prev, [id]: rating }));
  };

  const isLight = theme === 'light';

  return (
    <div className={`flex-1 flex flex-col h-[100dvh] overflow-hidden select-text ${
      isLight ? 'bg-white text-[#1f1f1f]' : 'bg-[#131314] text-[#e3e3e3]'
    }`}>
      {/* Top Navbar (Gemini Style) */}
      <header className={`h-14 border-b backdrop-blur-md px-3 sm:px-5 flex items-center justify-between shrink-0 z-20 ${
        isLight ? 'bg-white/90 border-black/5 text-[#1f1f1f]' : 'bg-[#131314]/90 border-white/5 text-[#e3e3e3]'
      }`}>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'text-zinc-600 hover:text-black hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Meniu"
            aria-label="Deschide meniul lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <TwLogo size={26} />
            <span className={`text-base font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              Tw
            </span>
            <span className="hidden sm:inline-block text-xs text-zinc-500 font-medium">
              · {activeMode.name}
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isLight
                  ? 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
              }`}
              title={isLight ? 'Comută pe Mod Întunecat' : 'Comută pe Mod Luminos'}
              aria-label="Comutator temă"
            >
              {isLight ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline text-[11px] font-semibold">Luminos</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#9B72CF]" />
                  <span className="hidden md:inline text-[11px] font-semibold">Întunecat</span>
                </>
              )}
            </button>
          )}

          {/* Auto-Speak Toggle */}
          <button
            type="button"
            onClick={() => {
              if (speakingMessageId) {
                stopSpeaking();
                setSpeakingMessageId(null);
              }
              setAutoSpeak(!autoSpeak);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              autoSpeak
                ? 'bg-[#9B72CF]/20 text-[#9B72CF] border border-[#9B72CF]/30'
                : isLight
                ? 'text-zinc-600 hover:text-black hover:bg-black/5 border border-transparent'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
            }`}
            title={autoSpeak ? 'Voce activată' : 'Activează vocea'}
          >
            {autoSpeak ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#9B72CF]" />
                <span className="hidden md:inline text-[11px] font-medium">Voce activată</span>
              </>
            ) : (
              <>
                <Volume className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Voce</span>
              </>
            )}
          </button>

          {/* Quota / Founder Badge */}
          {isFounder ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
              <span>👑</span>
              <span className="font-bold">Fondator</span>
            </div>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono tabular-nums border ${
                isQuotaExhausted
                  ? isLight
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-700'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  : isLastTwoWarning
                  ? isLight
                    ? 'bg-amber-50 border-amber-300 text-amber-700 animate-pulse'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'
                  : isLight
                  ? 'bg-zinc-100 border-black/5 text-zinc-600'
                  : 'bg-[#1e1f20] border-white/5 text-zinc-400'
              }`}
              title="Mesaje disponibile azi"
            >
              <Clock className="w-3 h-3 text-cyan-500" />
              <span>{remainingMessages} rămase</span>
            </div>
          )}

          {/* Admin Panel button for Founder / Superuser only */}
          {isPrivileged && (
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/10 text-zinc-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
              title="Panou de control"
            >
              <TwSparkleIcon size={14} />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-1">
            <button
              onClick={onLogout}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'text-zinc-500 hover:text-[#4285F4] hover:bg-black/5' : 'text-zinc-400 hover:text-[#4285F4] hover:bg-white/5'
              }`}
              title="Deconectare"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Quota warning notices */}
      {isLastTwoWarning && (
        <div className={`border-b px-4 py-2 text-xs flex items-center justify-center gap-2 animate-fadeIn shrink-0 ${
          isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/80 border-amber-500/30 text-amber-200'
        }`}>
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Atenție: Mai ai {remainingMessages} mesaje disponibile astăzi (se resetează la miezul nopții).</span>
        </div>
      )}

      {isQuotaExhausted && (
        <div className={`border-b px-4 py-2.5 text-xs flex items-center justify-between shrink-0 ${
          isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
        }`}>
          <div className="flex items-center gap-2 max-w-2xl mx-auto w-full">
            <Clock className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>Ai utilizat cele 23 de mesaje de elev pentru astăzi. Se resetează automat la miezul nopții.</span>
            {isPrivileged && (
              <button
                onClick={onResetQuota}
                className="ml-auto px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] cursor-pointer shadow-sm"
              >
                Reset Admin
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 max-w-3xl mx-auto w-full">
        {messages.length === 0 ? (
          /* Gemini-style Welcome View */
          <div className="min-h-[70vh] flex flex-col justify-center items-center text-center py-6 px-2">
            <div className="mb-4">
              <TwLogo size={68} withGlow={true} />
            </div>

            <div className="mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                <span className={isLight ? 'text-zinc-900' : 'text-white'}>Salut, </span>
                <span className="bg-gradient-to-r from-[#4285F4] via-[#9B72CF] to-[#D96570] bg-clip-text text-transparent">
                  {currentUser.name.split(' ')[0]}
                </span>
              </h1>
            </div>

            <p className={`text-base sm:text-lg font-medium mb-8 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Cu ce te pot ajuta astăzi?
            </p>

            {/* Gemini-style 4 suggestion cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left max-w-2xl">
              {activeMode.starterSuggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug.prompt)}
                  disabled={isQuotaExhausted}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group text-left flex flex-col justify-between shadow-sm active:scale-[0.99] disabled:opacity-50 ${
                    isLight
                      ? 'bg-[#f0f4f9] hover:bg-[#e9eef6] border-black/5 hover:border-black/10'
                      : 'bg-[#1e1f20] hover:bg-[#282a2c] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold group-hover:text-[#4285F4] transition-colors ${
                      isLight ? 'text-zinc-800' : 'text-zinc-200'
                    }`}>
                      {sug.title}
                    </span>
                    <TwSparkleIcon size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {sug.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation Messages */
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="shrink-0 mt-0.5">
                    <TwLogo size={28} withGlow={false} />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? isLight
                        ? 'bg-[#f0f4f9] text-[#1f1f1f] border border-black/5 rounded-tr-md shadow-sm'
                        : 'bg-[#282a2c] text-white rounded-tr-md shadow-sm'
                      : `bg-transparent px-1 py-1 ${isLight ? 'text-[#1f1f1f]' : 'text-[#e3e3e3]'}`
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div>
                      {/* If empty and loading, show Gemini glowing shimmering wave */}
                      {!msg.content && isLoading ? (
                        <div className="flex items-center gap-2 py-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-ping" />
                          <span className={`text-xs font-medium animate-pulse ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Tw gândește rapid...
                          </span>
                        </div>
                      ) : msg.content === '🎨 Se generează imaginea artistică cu Tw...' ? (
                        <div className={`my-2 p-3.5 rounded-2xl border flex items-center gap-3 animate-pulse max-w-sm ${
                          isLight
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/70 text-zinc-800'
                            : 'bg-gradient-to-r from-blue-950/40 to-purple-950/40 border-purple-500/30 text-zinc-200'
                        }`}>
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#4285F4] to-[#9B72CF] flex items-center justify-center text-white shrink-0 animate-spin">
                            <TwSparkleIcon size={14} />
                          </div>
                          <div>
                            <div className="text-xs font-bold">Se desenează imaginea...</div>
                            <div className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              Tw AI aplică stilul artistic de înaltă rezoluție.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <MarkdownRenderer content={msg.content} theme={theme} />
                      )}

                      {/* Generated Image Preview (if present) */}
                      {msg.imageUrl && (
                        <div className={`mt-3 rounded-2xl overflow-hidden border shadow-xl max-w-sm sm:max-w-md group/img relative ${
                          isLight ? 'border-black/10 bg-[#f0f4f9]' : 'border-white/10 bg-[#1e1f20]'
                        }`}>
                          <img
                            src={msg.imageUrl}
                            alt="Tw Generated Artwork"
                            referrerPolicy="no-referrer"
                            className="w-full h-auto object-cover max-h-96 rounded-2xl cursor-pointer transition-transform duration-200 group-hover/img:scale-[1.01]"
                            onClick={() => setSelectedImage(msg.imageUrl || null)}
                          />
                          <div className={`p-2.5 flex items-center justify-between border-t ${
                            isLight ? 'bg-[#f0f4f9] border-black/5' : 'bg-[#1e1f20]/95 border-white/5'
                          }`}>
                            <span className={`text-[11px] font-medium flex items-center gap-1.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                              <TwSparkleIcon size={13} />
                              Generat de Tw
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedImage(msg.imageUrl || null)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isLight ? 'hover:bg-black/5 text-zinc-600 hover:text-black' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                                }`}
                                title="Mărește imaginea"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={msg.imageUrl}
                                download={`tw-image-${msg.id}.jpg`}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isLight ? 'hover:bg-black/5 text-zinc-600 hover:text-black' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                                }`}
                                title="Descarcă imaginea"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Google Search Citations Grounding (if present) */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className={`mt-3 pt-2.5 border-t ${isLight ? 'border-black/10' : 'border-white/10'}`}>
                          <div className={`text-[11px] font-semibold mb-2 flex items-center gap-1.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            <Globe className="w-3.5 h-3.5 text-[#4285F4]" />
                            <span>Surse web verificate (Google Search):</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, sIdx) => {
                              let domain = 'google.com';
                              try {
                                domain = new URL(src.url).hostname.replace('www.', '');
                              } catch {
                                domain = src.title || 'sursă';
                              }
                              return (
                                <a
                                  key={sIdx}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all shadow-sm ${
                                    isLight
                                      ? 'bg-[#f0f4f9] hover:bg-[#e9eef6] text-zinc-700 hover:text-black border-black/5 hover:border-[#4285F4]/40'
                                      : 'bg-[#1e1f20] hover:bg-[#282a2c] text-zinc-300 hover:text-white border-white/5 hover:border-[#4285F4]/40'
                                  }`}
                                  title={src.title || src.url}
                                >
                                  <span className="truncate max-w-[150px] sm:max-w-[220px] font-medium text-[11px]">
                                    {src.title || domain}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-[#4285F4] shrink-0" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Double Verification Badge (Always positive, emerald/cyan, zero red, zero X) */}
                      {msg.verification && (
                        <div className={`mt-3 p-3 rounded-2xl border text-xs ${
                          isLight
                            ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950 shadow-sm'
                            : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 font-bold">
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                              <span>Validare Dublă Tw AI</span>
                            </div>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                              Încredere: {msg.verification.overallConfidence}%
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className={`p-2 rounded-xl border ${
                              isLight ? 'bg-white/90 border-emerald-200/60' : 'bg-[#131314]/60 border-emerald-500/20'
                            }`}>
                              <div className="flex items-center gap-1 font-semibold text-emerald-500 mb-0.5">
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>{msg.verification.check1.title}</span>
                              </div>
                              <p className="opacity-80 leading-relaxed">{msg.verification.check1.details}</p>
                            </div>
                            <div className={`p-2 rounded-xl border ${
                              isLight ? 'bg-white/90 border-emerald-200/60' : 'bg-[#131314]/60 border-emerald-500/20'
                            }`}>
                              <div className="flex items-center gap-1 font-semibold text-emerald-500 mb-0.5">
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>{msg.verification.check2.title}</span>
                              </div>
                              <p className="opacity-80 leading-relaxed">{msg.verification.check2.details}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Gemini action toolbar under assistant message */}
                      {msg.content && (
                        <div className={`flex items-center gap-1 mt-3 pt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                          {/* Copy button */}
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLight ? 'hover:text-black hover:bg-black/5' : 'hover:text-white hover:bg-white/5'
                            }`}
                            title="Copiază răspunsul"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Speak aloud button */}
                          <button
                            onClick={() => handleSpeak(msg.id, msg.content)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSpeaking
                                ? 'text-[#9B72CF] bg-[#9B72CF]/20'
                                : isLight
                                ? 'hover:text-black hover:bg-black/5'
                                : 'hover:text-white hover:bg-white/5'
                            }`}
                            title={isSpeaking ? 'Oprește vocea' : 'Ascultă răspunsul'}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Double Verification Action Button */}
                          <button
                            onClick={() => {
                              const msgIndex = messages.findIndex((m) => m.id === msg.id);
                              const prevMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
                              const question = prevMsg?.role === 'user' ? prevMsg.content : 'Context general';
                              onVerifyMessage(msg.id, question, msg.content);
                            }}
                            disabled={verifyingMessageId === msg.id}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
                              msg.verification
                                ? 'text-emerald-500 bg-emerald-500/10'
                                : isLight
                                ? 'hover:text-black hover:bg-black/5 text-zinc-500'
                                : 'hover:text-white hover:bg-white/5 text-zinc-400'
                            }`}
                            title="Verifică acuratețea și siguranța răspunsului"
                          >
                            {verifyingMessageId === msg.id ? (
                              <TwSparkleIcon size={13} className="animate-spin text-[#4285F4]" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            <span className="hidden sm:inline">
                              {msg.verification ? 'Verificat 100%' : 'Verifică'}
                            </span>
                          </button>

                          {/* Like rating */}
                          <button
                            onClick={() => handleRate(msg.id, 'up')}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              ratings[msg.id] === 'up'
                                ? 'text-[#4285F4]'
                                : isLight
                                ? 'hover:text-black hover:bg-black/5'
                                : 'hover:text-white hover:bg-white/5'
                            }`}
                            title="Răspuns bun"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Dislike rating */}
                          <button
                            onClick={() => handleRate(msg.id, 'down')}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              ratings[msg.id] === 'down'
                                ? 'text-zinc-500 bg-zinc-500/10'
                                : isLight
                                ? 'hover:text-black hover:bg-black/5'
                                : 'hover:text-white hover:bg-white/5'
                            }`}
                            title="Răspuns slab"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Regenerate */}
                          <button
                            onClick={onRegenerateLast}
                            disabled={isLoading}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
                              isLight ? 'hover:text-black hover:bg-black/5' : 'hover:text-white hover:bg-white/5'
                            }`}
                            title="Regenerează răspunsul"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Gemini Input Bar */}
      <div className="p-3 sm:p-4 bg-transparent shrink-0">
        <div className="max-w-3xl mx-auto w-full">
          {/* Active Speaking Status Banner */}
          {speakingMessageId && (
            <div className={`mb-2 p-2 rounded-2xl border flex items-center justify-between text-xs animate-fadeIn ${
              isLight
                ? 'bg-[#f0f4f9] border-[#9B72CF]/50 text-[#9B72CF]'
                : 'bg-[#1e1f20] border-[#9B72CF]/40 text-[#9B72CF]'
            }`}>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className={`font-semibold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  Tw citește răspunsul cu voce tare...
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setSpeakingMessageId(null);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  isLight ? 'bg-black/10 hover:bg-black/15 text-zinc-700' : 'bg-white/10 hover:bg-white/15 text-zinc-200'
                }`}
              >
                Oprește
              </button>
            </div>
          )}

          {/* Active Voice Dictation Banner */}
          {isDictating && (
            <div className={`mb-2 p-2.5 rounded-2xl border flex items-center justify-between text-xs animate-fadeIn ${
              isLight
                ? 'bg-purple-50 border-purple-200 text-purple-900'
                : 'bg-purple-950/40 border-purple-500/40 text-purple-200'
            }`}>
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#9B72CF] shrink-0 animate-bounce" />
                <span className="font-semibold">
                  Dictare vocală pornită: Vorbește acum în microfon...
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleDictation}
                className="px-3 py-1 bg-gradient-to-r from-[#4285F4] to-[#9B72CF] hover:opacity-90 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Gata
              </button>
            </div>
          )}

          {/* Quick feature action pills */}
          <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={handleOpenImageModal}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] shrink-0 transition-colors cursor-pointer active:scale-98 ${
                isLight
                  ? 'bg-[#f0f4f9] hover:bg-[#e9eef6] border-black/5 text-zinc-700'
                  : 'bg-[#1e1f20] hover:bg-[#282a2c] border-white/5 text-zinc-300'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#9B72CF]" />
              <span>Imagine AI</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMode(currentMode === 'search' ? 'general' : 'search')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] shrink-0 transition-colors cursor-pointer active:scale-98 ${
                currentMode === 'search'
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-600 dark:text-cyan-300 font-medium'
                  : isLight
                  ? 'bg-[#f0f4f9] hover:bg-[#e9eef6] border-black/5 text-zinc-700'
                  : 'bg-[#1e1f20] hover:bg-[#282a2c] border-white/5 text-zinc-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-500" />
              <span>Căutare Web Live</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('game3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] shrink-0 transition-colors cursor-pointer active:scale-98 ${
                isLight
                  ? 'bg-[#f0f4f9] hover:bg-[#e9eef6] border-black/5 text-zinc-700'
                  : 'bg-[#1e1f20] hover:bg-[#282a2c] border-white/5 text-zinc-300'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Joc 3D Arcade</span>
            </button>
          </div>

          {/* Gemini Floating Input Pill */}
          <div
            className={`relative flex items-center gap-2 border rounded-3xl p-2 sm:p-2.5 transition-all ${
              isLight
                ? 'bg-[#f0f4f9] border-black/10 focus-within:border-[#4285F4]/70 focus-within:ring-2 focus-within:ring-[#4285F4]/20 shadow-lg'
                : 'bg-[#1e1f20] border-white/10 focus-within:border-[#9B72CF]/70 focus-within:ring-2 focus-within:ring-[#4285F4]/20 shadow-2xl'
            } ${isQuotaExhausted ? (isLight ? 'border-zinc-300 opacity-80' : 'border-zinc-700 opacity-80') : ''}`}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              disabled={isQuotaExhausted}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isQuotaExhausted
                  ? 'Limita de 23 de mesaje a fost atinsă pe astăzi.'
                  : currentMode === 'search'
                  ? 'Caută informații actualizate pe web cu Tw...'
                  : 'Întreabă-l pe Tw orice...'
              }
              className={`flex-1 bg-transparent text-sm px-3 py-1.5 focus:outline-none resize-none max-h-36 min-h-[38px] leading-relaxed disabled:cursor-not-allowed ${
                isLight ? 'text-[#1f1f1f] placeholder-zinc-500' : 'text-white placeholder-zinc-500'
              }`}
            />

            <div className="flex items-center gap-1 shrink-0">
              {/* Image generator button */}
              <button
                type="button"
                onClick={handleOpenImageModal}
                disabled={isQuotaExhausted || isLoading}
                className={`p-2 rounded-full transition-all cursor-pointer disabled:opacity-40 ${
                  isLight ? 'text-zinc-500 hover:text-[#9B72CF] hover:bg-black/5' : 'text-zinc-400 hover:text-[#9B72CF] hover:bg-white/5'
                }`}
                title="Generează o Imagine AI"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Microphone dictation button */}
              {isSpeechRecognitionSupported() && (
                <button
                  type="button"
                  onClick={handleToggleDictation}
                  disabled={isQuotaExhausted}
                  className={`p-2 rounded-full transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDictating
                      ? 'bg-gradient-to-r from-[#4285F4] to-[#9B72CF] text-white animate-pulse shadow-md'
                      : isLight
                      ? 'text-zinc-500 hover:text-black hover:bg-black/5'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={isDictating ? 'Oprește dictarea' : 'Dictare vocală'}
                >
                  {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {/* Send / Stop button */}
              {isLoading ? (
                <button
                  type="button"
                  disabled={true}
                  className="p-2.5 bg-[#4285F4]/30 text-[#4285F4] rounded-full transition-all"
                  title="Se generează răspunsul..."
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isQuotaExhausted}
                  className={`p-2.5 rounded-full transition-all cursor-pointer active:scale-95 shadow-sm ${
                    inputText.trim() && !isQuotaExhausted
                      ? 'bg-gradient-to-r from-[#4285F4] to-[#9B72CF] text-white hover:opacity-90'
                      : isLight
                      ? 'bg-black/5 text-zinc-400 cursor-not-allowed'
                      : 'bg-white/10 text-zinc-500 cursor-not-allowed'
                  }`}
                  title="Trimite mesajul"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Gemini-style Disclaimer Footer */}
          <div className="text-center mt-2 text-[11px] text-zinc-500">
            <span>Tw poate afișa informații inexacte. Verifică răspunsurile importante.</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Zoom Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden border shadow-2xl flex flex-col ${
              isLight ? 'bg-white border-black/10' : 'bg-[#1e1f20] border-white/10'
            }`}
          >
            <div className={`p-3 border-b flex items-center justify-between ${
              isLight ? 'bg-white border-black/10' : 'bg-[#1e1f20] border-white/10'
            }`}>
              <div className={`flex items-center gap-2 text-xs font-semibold ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}>
                <TwSparkleIcon size={14} />
                <span>Imagine Tw AI (Rezoluție Completă)</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedImage}
                  download="tw-artwork-hd.png"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'text-zinc-600 hover:text-black hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Descarcă imaginea"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedImage(null)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'text-zinc-600 hover:text-black hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-auto p-2 flex items-center justify-center bg-black/40">
              <img
                src={selectedImage}
                alt="Zoomed Visual"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Prompt Creation Modal */}
      {showImagePromptModal && (
        <div
          onClick={() => setShowImagePromptModal(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-5 text-left ${
              isLight ? 'bg-white border-black/10' : 'bg-[#1e1f20] border-white/10'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-black/10' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4285F4] to-[#9B72CF] flex items-center justify-center text-white">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    Generare Imagine Artistică Tw
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Descrie orice dorești să deseneze Tw AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImagePromptModal(false)}
                className={`p-1 rounded-lg cursor-pointer transition-colors ${
                  isLight ? 'text-zinc-500 hover:text-black hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                Descrierea imaginii (Prompt)
              </label>
              <textarea
                rows={3}
                value={imagePromptInput}
                onChange={(e) => setImagePromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const prompt = imagePromptInput.trim();
                    if (prompt && !isLoading) {
                      setShowImagePromptModal(false);
                      setImagePromptInput('');
                      onGenerateImage(prompt);
                    }
                  }
                }}
                placeholder="Exemplu: Un astronaut explorând o junglă bioluminescentă pe o planetă extraterestră..."
                className={`w-full border rounded-2xl p-3 text-xs focus:outline-none resize-none leading-relaxed ${
                  isLight
                    ? 'bg-zinc-50 border-black/10 focus:border-[#4285F4] text-zinc-900 placeholder-zinc-400'
                    : 'bg-[#131314] border-white/10 focus:border-[#9B72CF] text-white placeholder-zinc-500'
                }`}
              />

              <div className="mt-3">
                <div className={`text-[11px] font-medium mb-1.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Idei creative rapide:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Oraș plutitor în nori la apus',
                    'Pisică astronaut în costum spațial cyberpunk',
                    'Pădure magică cu ciuperci neon luminoase',
                    'Robot prietenos învățând un elev programare',
                  ].map((idea, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImagePromptInput(idea)}
                      className={`text-[10px] px-2.5 py-1 rounded-xl border transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-black/5'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5'
                      }`}
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`mt-5 pt-3 border-t flex items-center justify-end gap-2 ${
              isLight ? 'border-black/10' : 'border-white/5'
            }`}>
              <button
                type="button"
                onClick={() => setShowImagePromptModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isLight ? 'text-zinc-600 hover:text-black hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={!imagePromptInput.trim() || isLoading}
                onClick={async () => {
                  const prompt = imagePromptInput.trim();
                  if (!prompt) return;
                  setShowImagePromptModal(false);
                  setImagePromptInput('');
                  await onGenerateImage(prompt);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#9B72CF] hover:opacity-90 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-40 shadow-sm"
              >
                <TwSparkleIcon size={14} />
                <span>Creează Imagine</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
