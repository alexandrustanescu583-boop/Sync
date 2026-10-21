import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { AuthScreen } from './components/AuthScreen';
import { Tw3DGame } from './components/Tw3DGame';
import {
  ChatSession,
  ChatMessage,
  AssistantModeId,
  UserRole,
  MemoryItem,
  VerificationResult,
  UserAccount,
} from './types';

const STORAGE_USERS_KEY = 'gemini_safe_registered_users';
const STORAGE_CURRENT_USER_ID = 'gemini_safe_current_user_id';
const STORAGE_SPEED_KEY = 'gemini_safe_speed_priority';
const STORAGE_AUTOVERIFY_KEY = 'gemini_safe_auto_verify';

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

const createDefaultSession = (mode: AssistantModeId = 'general'): ChatSession => ({
  id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: 'Conversație Nouă',
  mode,
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-founder-1',
    name: 'Alexandru Stănescu',
    email: 'alexandrustanescu583@gmail.com',
    password: 'admin',
    role: 'fondator',
    dailyMessageCount: 0,
    lastMessageDate: getTodayDateString(),
    maxDailyMessages: 23,
    createdAt: Date.now(),
  },
];

export default function App() {
  // 1. Registered Users State
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const today = getTodayDateString();
          // Filter out the old mock/sample demo users
          return parsed
            .filter(
              (u) =>
                u.id !== 'user-student-1' &&
                u.id !== 'user-student-2' &&
                u.email !== 'maria@scoala.ro' &&
                u.email !== 'andrei@scoala.ro'
            )
            .map((u) => {
              let role = u.role;
              // Only Alexandru's exact email retains the fondator role by default
              if (u.email.toLowerCase() === 'alexandrustanescu583@gmail.com') {
                role = 'fondator';
              }
              if (u.lastMessageDate !== today) {
                return { ...u, role, dailyMessageCount: 0, lastMessageDate: today };
              }
              return { ...u, role };
            });
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_USERS;
  });

  // 2. Current User State
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_CURRENT_USER_ID) || null;
  });

  const currentUser = registeredUsers.find((u) => u.id === currentUserId) || null;

  // Persist users
  useEffect(() => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Persist logged in user id and keep state synchronized
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_CURRENT_USER_ID, currentUser.id);
      if (currentUserId !== currentUser.id) {
        setCurrentUserId(currentUser.id);
      }
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_ID);
    }
  }, [currentUser, currentUserId]);

  // 3. Per-User Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const savedUserId = localStorage.getItem(STORAGE_CURRENT_USER_ID) || 'user-founder-1';
    const sessionKey = `gemini_sessions_${savedUserId}`;
    try {
      const savedSessions = localStorage.getItem(sessionKey);
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [createDefaultSession()];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || `session-${Date.now()}`;
  });

  // 4. Per-User Memory State
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const savedUserId = localStorage.getItem(STORAGE_CURRENT_USER_ID) || 'user-founder-1';
    const memoryKey = `gemini_memories_${savedUserId}`;
    try {
      const savedMemories = localStorage.getItem(memoryKey);
      if (savedMemories) {
        return JSON.parse(savedMemories);
      }
    } catch {
      // fallback
    }
    return [
      {
        id: `mem-${Date.now()}-1`,
        text: 'Utilizatorul este Alexandru Stănescu (Fondator Tw).',
        createdAt: Date.now(),
      },
      {
        id: `mem-${Date.now()}-2`,
        text: 'Rol: fondator. Limită zilnică: Nelimitat.',
        createdAt: Date.now(),
      },
    ];
  });

  // Load user-specific sessions and memories when current user changes
  useEffect(() => {
    if (!currentUser) return;

    // Load sessions
    const sessionKey = `gemini_sessions_${currentUser.id}`;
    const savedSessions = localStorage.getItem(sessionKey);
    let loadedSessions: ChatSession[] = [];
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedSessions = parsed;
        }
      } catch {
        // fallback
      }
    }

    if (loadedSessions.length === 0) {
      loadedSessions = [createDefaultSession()];
    }

    setSessions(loadedSessions);
    setActiveSessionId(loadedSessions[0].id);

    // Load memories
    const memoryKey = `gemini_memories_${currentUser.id}`;
    const savedMemories = localStorage.getItem(memoryKey);
    if (savedMemories) {
      try {
        setMemories(JSON.parse(savedMemories));
      } catch {
        setMemories([]);
      }
    } else {
      // Seed default memory
      setMemories([
        {
          id: `mem-${Date.now()}-1`,
          text: `Utilizatorul este ${currentUser.name} (${currentUser.email}).`,
          createdAt: Date.now(),
        },
        {
          id: `mem-${Date.now()}-2`,
          text: `Rol: ${currentUser.role}. Limită zilnică: ${
            currentUser.role === 'fondator' ? 'Nelimitat' : '23 de mesaje'
          }.`,
          createdAt: Date.now(),
        },
      ]);
    }
  }, [currentUser?.id]);

  // Save sessions per user
  useEffect(() => {
    if (!currentUser) return;
    const sessionKey = `gemini_sessions_${currentUser.id}`;
    localStorage.setItem(sessionKey, JSON.stringify(sessions));
  }, [sessions, currentUser?.id]);

  // Save memories per user
  useEffect(() => {
    if (!currentUser) return;
    const memoryKey = `gemini_memories_${currentUser.id}`;
    localStorage.setItem(memoryKey, JSON.stringify(memories));
  }, [memories, currentUser?.id]);

  // 5. Custom System Prompt Override & Speed Settings
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [speedPriority, setSpeedPriority] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_SPEED_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const [autoVerify, setAutoVerify] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_AUTOVERIFY_KEY);
    return saved !== null ? saved === 'true' : false;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyingMessageId, setVerifyingMessageId] = useState<string | null>(null);

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('tw_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('tw_theme', theme);
    } catch {
      // ignore
    }
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_SPEED_KEY, speedPriority.toString());
  }, [speedPriority]);

  useEffect(() => {
    localStorage.setItem(STORAGE_AUTOVERIFY_KEY, autoVerify.toString());
  }, [autoVerify]);

  // Auth Handlers
  const handleLogin = (user: UserAccount, target: 'chat' | 'founder_menu' = 'chat') => {
    const today = getTodayDateString();
    let updatedUser: UserAccount = { ...user };
    if (updatedUser.email.toLowerCase() === 'alexandrustanescu583@gmail.com') {
      updatedUser.role = 'fondator';
    }
    if (user.lastMessageDate !== today) {
      updatedUser = { ...updatedUser, dailyMessageCount: 0, lastMessageDate: today };
    }
    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.id === updatedUser.id);
      const nextList = exists
        ? prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        : [updatedUser, ...prev];
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(nextList));
      } catch (err) {
        console.error('Storage save error:', err);
      }
      return nextList;
    });
    // Immediately synchronize user sessions and memories for instant zero-delay access
    const sessionKey = `gemini_sessions_${updatedUser.id}`;
    const savedSessions = localStorage.getItem(sessionKey);
    let loadedSessions: ChatSession[] = [];
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedSessions = parsed;
        }
      } catch {
        // ignore
      }
    }
    if (loadedSessions.length === 0) {
      loadedSessions = [createDefaultSession()];
    }
    setSessions(loadedSessions);
    setActiveSessionId(loadedSessions[0].id);

    const memoryKey = `gemini_memories_${updatedUser.id}`;
    const savedMemories = localStorage.getItem(memoryKey);
    if (savedMemories) {
      try {
        setMemories(JSON.parse(savedMemories));
      } catch {
        setMemories([]);
      }
    }

    setCurrentUserId(updatedUser.id);
    try {
      localStorage.setItem(STORAGE_CURRENT_USER_ID, updatedUser.id);
    } catch (err) {
      console.error('Storage user ID error:', err);
    }

    if (target === 'founder_menu') {
      setIsAdminOpen(true);
    } else {
      setIsAdminOpen(false);
    }
  };

  const handleRegister = (newUser: UserAccount) => {
    // New accounts are ALWAYS created as standard student role with standard 23 limit
    const finalUser: UserAccount = {
      ...newUser,
      role: 'student',
    };
    setRegisteredUsers((prev) => {
      const nextList = [finalUser, ...prev.filter((u) => u.id !== finalUser.id)];
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(nextList));
      } catch (err) {
        console.error('Storage save error:', err);
      }
      return nextList;
    });

    const loadedSessions = [createDefaultSession()];
    setSessions(loadedSessions);
    setActiveSessionId(loadedSessions[0].id);

    setCurrentUserId(finalUser.id);
    try {
      localStorage.setItem(STORAGE_CURRENT_USER_ID, finalUser.id);
    } catch (err) {
      console.error('Storage user ID error:', err);
    }
  };

  const handleLogout = () => {
    setCurrentUserId(null);
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setRegisteredUsers((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Storage user save error:', err);
      }
      return next;
    });
  };

  const handleResetSpecificUserQuota = (userId: string) => {
    setRegisteredUsers((prev) => {
      const next = prev.map((u) =>
        u.id === userId ? { ...u, dailyMessageCount: 0 } : u
      );
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Storage user save error:', err);
      }
      return next;
    });
  };

  const handleResetQuota = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, dailyMessageCount: 0 };
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updated : u))
    );
  };

  // If user is not logged in, show AuthScreen
  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        registeredUsers={registeredUsers}
        onRegister={handleRegister}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const activeSession: ChatSession =
    sessions.find((s) => s.id === activeSessionId) ||
    sessions[0] ||
    createDefaultSession();

  // Handlers for sessions
  const handleNewChat = (mode: AssistantModeId = activeSession?.mode || 'general') => {
    const newSession = createDefaultSession(mode);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'Conversație Nouă',
          mode: 'general',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleChangeMode = (mode: AssistantModeId) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, mode } : s))
    );
  };

  const handleAddMemory = (text: string) => {
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      text: text.trim(),
      createdAt: Date.now(),
    };
    setMemories((prev) => [newMem, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleVerifyMessage = async (
    messageId: string,
    question: string,
    answer: string
  ) => {
    setVerifyingMessageId(messageId);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });

      if (!response.ok) throw new Error('Verification failed');
      const verification: VerificationResult = await response.json();

      setSessions((prev) =>
        prev.map((s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === messageId ? { ...m, verification } : m
          ),
        }))
      );
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setVerifyingMessageId(null);
    }
  };

  // Ultra-Fast Streaming Message Handler with 23 Quota Enforcement
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const today = getTodayDateString();
    const effectiveCount =
      currentUser.lastMessageDate === today ? currentUser.dailyMessageCount : 0;

    // Check if user has exceeded quota (unless fondator or superuser)
    if (
      currentUser.role !== 'fondator' &&
      currentUser.role !== 'superuser' &&
      effectiveCount >= currentUser.maxDailyMessages
    ) {
      return;
    }

    // Increment message count for the current user
    const updatedUser = {
      ...currentUser,
      dailyMessageCount: effectiveCount + 1,
      lastMessageDate: today,
    };
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );

    const userMessage: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const isFirstMessage = activeSession.messages.length === 0;
    const updatedMessages = [...activeSession.messages, userMessage];

    // Optimistically update session
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsLoading(true);

    const assistantMsgId = `msg-bot-${Date.now()}`;
    const initialBotMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...updatedMessages, initialBotMessage],
            }
          : s
      )
    );

    let accumulatedText = '';

    try {
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode: activeSession.mode,
          userRole: currentUser.role,
          memories: memories.map((m) => m.text),
          customPromptOverride: customPrompt,
          speedPriority,
          useGoogleSearch: activeSession.mode === 'search',
        }),
      });

      if (!response.ok || !response.body) {
        // Immediate fallback to standard /api/chat endpoint
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            mode: activeSession.mode,
            userRole: currentUser.role,
            memories: memories.map((m) => m.text),
            customPromptOverride: customPrompt,
          }),
        });

        if (!fallbackRes.ok) {
          throw new Error(`Server status: ${fallbackRes.status}`);
        }

        const data = await fallbackRes.json();
        accumulatedText = data.reply || 'Răspunsul a fost procesat cu succes.';
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                  ),
                }
              : s
          )
        );
      } else {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.id === activeSessionId
                        ? {
                            ...s,
                            messages: s.messages.map((m) =>
                              m.id === assistantMsgId
                                ? { ...m, content: accumulatedText }
                                : m
                            ),
                          }
                        : s
                    )
                  );
                } else if (parsed.sources && Array.isArray(parsed.sources)) {
                  const sources = parsed.sources;
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.id === activeSessionId
                        ? {
                            ...s,
                            messages: s.messages.map((m) =>
                              m.id === assistantMsgId
                                ? { ...m, sources }
                                : m
                            ),
                          }
                        : s
                    )
                  );
                } else if (parsed.error) {
                  accumulatedText = `Eroare: ${parsed.error}`;
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.id === activeSessionId
                        ? {
                            ...s,
                            messages: s.messages.map((m) =>
                              m.id === assistantMsgId
                                ? { ...m, content: accumulatedText }
                                : m
                            ),
                          }
                        : s
                    )
                  );
                }
              } catch {
                // ignore
              }
            }
          }
        }
      }

      if (!accumulatedText.trim()) {
        accumulatedText = 'Răspunsul a fost procesat cu succes.';
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: accumulatedText }
                      : m
                  ),
                }
              : s
          )
        );
      }

      // First prompt title generation
      if (isFirstMessage) {
        fetch('/api/generate-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: content }),
        })
          .then((res) => res.json())
          .then((resData) => {
            if (resData.title) {
              handleRenameSession(activeSessionId, resData.title);
            }
          })
          .catch((err) => console.warn('Title fetch error:', err));
      }

      // Auto-verify if enabled
      if (autoVerify) {
        handleVerifyMessage(assistantMsgId, content, accumulatedText);
      }
    } catch (err) {
      console.error('Send error:', err);
      // Secondary fallback to regular /api/chat if not attempted
      if (!accumulatedText) {
        try {
          const fallbackRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: updatedMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              mode: activeSession.mode,
              userRole: currentUser.role,
              memories: memories.map((m) => m.text),
              customPromptOverride: customPrompt,
            }),
          });
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            accumulatedText = data.reply || '';
          }
        } catch (fallbackErr) {
          console.error('Secondary fallback error:', fallbackErr);
        }
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content:
                          accumulatedText ||
                          'Conexiunea este activă. Te rugăm să trimiți din nou întrebarea.',
                      }
                    : m
                ),
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Image Generation Handler using Tw (gemini-3.1-flash-lite-image)
  const handleGenerateImage = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    const today = getTodayDateString();
    const effectiveCount =
      currentUser.lastMessageDate === today ? currentUser.dailyMessageCount : 0;

    if (
      currentUser.role !== 'fondator' &&
      currentUser.role !== 'superuser' &&
      effectiveCount >= currentUser.maxDailyMessages
    ) {
      return;
    }

    // Increment message count for non-founder
    if (currentUser.role !== 'fondator' && currentUser.role !== 'superuser') {
      const updatedUser = {
        ...currentUser,
        dailyMessageCount: effectiveCount + 1,
        lastMessageDate: today,
      };
      setRegisteredUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
      );
    }

    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      role: 'user',
      content: `🎨 Generează imagine: ${prompt.trim()}`,
      timestamp: Date.now(),
    };

    const assistantMsgId = `msg-bot-${Date.now()}`;
    const botMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '🎨 Se generează imaginea artistică cu Tw...',
      timestamp: Date.now(),
    };

    const updatedMessages = [...activeSession.messages, userMsg, botMsg];
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: updatedMessages, updatedAt: Date.now() }
          : s
      )
    );

    setIsLoading(true);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Generarea imaginii a eșuat');
      }

      const data = await res.json();
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: `Imagine generată pentru: **"${prompt}"**`,
                        imageUrl: data.imageUrl,
                      }
                    : m
                ),
              }
            : s
        )
      );
    } catch (err: any) {
      console.error('Image gen error:', err);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: `Nu s-a putut genera imaginea: ${err?.message || 'Eroare conexiune'}. Te rog încearcă din nou.`,
                      }
                    : m
                ),
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateLast = async () => {
    if (activeSession.messages.length === 0 || isLoading) return;

    const lastUserIndex = [...activeSession.messages]
      .reverse()
      .findIndex((m) => m.role === 'user');

    if (lastUserIndex === -1) return;

    const actualIndex = activeSession.messages.length - 1 - lastUserIndex;
    const lastUserMsg = activeSession.messages[actualIndex];

    const trimmed = activeSession.messages.slice(0, actualIndex);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: trimmed } : s
      )
    );

    await handleSendMessage(lastUserMsg.content);
  };

  const handleExportAll = () => {
    const data = {
      user: currentUser,
      sessions,
      memories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-ai-${currentUser.name.replace(/\s+/g, '_')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex h-[100dvh] w-screen overflow-hidden font-sans selection:bg-[#9B72CF]/30 selection:text-white transition-colors duration-150 ${
      theme === 'light' ? 'bg-white text-[#1f1f1f]' : 'bg-[#131314] text-[#e3e3e3]'
    }`}>
      {/* Sidebar with SuperUser Controls and User Profile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        currentMode={activeSession?.mode || 'general'}
        onChangeMode={handleChangeMode}
        onOpenAdmin={() => setIsAdminOpen(true)}
        userRole={currentUser.role}
        memoryCount={memories.length}
        speedPriority={speedPriority}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main View: 3D Game or Gemini Chat Interface */}
      {activeSession?.mode === 'game3d' ? (
        <div className="flex-1 h-full w-full relative">
          <Tw3DGame
            onBackToChat={() => handleChangeMode('general')}
            userName={currentUser.name}
          />
        </div>
      ) : (
        <ChatInterface
          session={activeSession}
          onSendMessage={handleSendMessage}
          onGenerateImage={handleGenerateImage}
          onRegenerateLast={handleRegenerateLast}
          isLoading={isLoading}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentMode={activeSession?.mode || 'general'}
          onChangeMode={handleChangeMode}
          onOpenAdmin={() => setIsAdminOpen(true)}
          userRole={currentUser.role}
          speedPriority={speedPriority}
          onVerifyMessage={handleVerifyMessage}
          verifyingMessageId={verifyingMessageId}
          currentUser={currentUser}
          onLogout={handleLogout}
          onResetQuota={handleResetQuota}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* SuperUser & Memory Console Modal */}
      <AdminConsoleModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        userRole={currentUser.role}
        onChangeRole={(newRole) => {
          const updated = { ...currentUser, role: newRole };
          setRegisteredUsers((prev) =>
            prev.map((u) => (u.id === currentUser.id ? updated : u))
          );
        }}
        memories={memories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        customPrompt={customPrompt}
        onUpdateCustomPrompt={setCustomPrompt}
        speedPriority={speedPriority}
        onToggleSpeedPriority={() => setSpeedPriority(!speedPriority)}
        autoVerify={autoVerify}
        onToggleAutoVerify={() => setAutoVerify(!autoVerify)}
        onExportAll={handleExportAll}
        registeredUsers={registeredUsers}
        onUpdateUserRole={handleUpdateUserRole}
        onResetUserQuota={handleResetSpecificUserQuota}
        theme={theme}
      />
    </div>
  );
}
