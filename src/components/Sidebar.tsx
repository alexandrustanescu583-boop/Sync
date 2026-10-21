import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  BookOpen,
  PenTool,
  Code2,
  LogOut,
  Sliders,
  Gamepad2,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { ChatSession, AssistantModeId, UserAccount } from '../types';
import { ASSISTANT_MODES } from '../data/modesData';
import { TwLogo, TwSparkleIcon } from './TwLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: (mode?: AssistantModeId) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  currentMode: AssistantModeId;
  onChangeMode: (mode: AssistantModeId) => void;
  onOpenAdmin: () => void;
  userRole: string;
  memoryCount: number;
  speedPriority: boolean;
  currentUser: UserAccount;
  onLogout: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  currentMode,
  onChangeMode,
  onOpenAdmin,
  userRole,
  currentUser,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  const isLight = theme === 'light';

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const getModeIcon = (modeId: AssistantModeId) => {
    switch (modeId) {
      case 'search':
        return <Globe className="w-4 h-4 text-cyan-500" />;
      case 'homework':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'creative':
        return <PenTool className="w-4 h-4 text-pink-500" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-amber-500" />;
      case 'game3d':
        return <Gamepad2 className="w-4 h-4 text-purple-500" />;
      default:
        return <TwSparkleIcon size={16} />;
    }
  };

  const activeModeObj = ASSISTANT_MODES.find((m) => m.id === currentMode) || ASSISTANT_MODES[0];
  const isPrivileged = userRole === 'fondator' || userRole === 'superuser';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-all duration-200 ease-in-out ${
          isLight
            ? 'bg-[#f0f4f9] border-r border-black/10 text-[#1f1f1f]'
            : 'bg-[#1e1f20] border-r border-white/10 text-[#e3e3e3]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header */}
        <div className={`p-3.5 border-b flex items-center justify-between ${isLight ? 'border-black/5' : 'border-white/5'}`}>
          <div className="flex items-center gap-2.5">
            <TwLogo size={32} />
            <div>
              <div className={`text-base font-bold tracking-tight flex items-center gap-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                <span>Tw</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isLight ? 'bg-black/5 text-zinc-700' : 'bg-white/10 text-zinc-300'}`}>
                  AI
                </span>
              </div>
              <div className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Inspirat de Gemini
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`lg:hidden p-1 rounded-lg transition-colors ${
              isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold text-xs rounded-2xl border transition-all cursor-pointer shadow-sm active:scale-98 ${
              isLight
                ? 'bg-white hover:bg-zinc-100 text-zinc-900 border-black/10 hover:border-black/20'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            <Plus className="w-4 h-4 text-[#9B72CF]" />
            <span>Chat Nou</span>
          </button>

          {/* Mode Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-colors cursor-pointer border ${
                isLight
                  ? 'bg-white hover:bg-zinc-100 border-black/10'
                  : 'bg-[#131314] hover:bg-[#282a2c] border-white/5'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {getModeIcon(currentMode)}
                <div className="truncate">
                  <div className={`text-xs font-semibold truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    {activeModeObj.name}
                  </div>
                  <div className={`text-[10px] truncate ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {activeModeObj.shortDesc}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </button>

            {isModeDropdownOpen && (
              <div
                className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl shadow-2xl z-30 p-1.5 space-y-0.5 border ${
                  isLight
                    ? 'bg-white border-black/10 text-zinc-900 shadow-xl'
                    : 'bg-[#1e1f20] border-white/10 text-zinc-100 backdrop-blur-xl'
                }`}
              >
                {ASSISTANT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      onChangeMode(mode.id);
                      setIsModeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      currentMode === mode.id
                        ? isLight
                          ? 'bg-[#e9eef6] text-[#4285F4] font-semibold'
                          : 'bg-[#282a2c] text-white font-semibold'
                        : isLight
                        ? 'text-zinc-700 hover:bg-zinc-100'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    {getModeIcon(mode.id)}
                    <div className="min-w-0">
                      <div className={`font-medium ${isLight ? 'text-zinc-900' : 'text-white'}`}>{mode.name}</div>
                      <div className={`text-[10px] truncate ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {mode.shortDesc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className={`px-3 py-1.5 text-[11px] font-semibold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Recente
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-zinc-500 italic">
              Nicio conversație încă. Începe una nouă!
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-white text-zinc-900 font-semibold shadow-sm border border-black/5'
                        : 'bg-[#282a2c] text-white font-medium shadow-sm'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing(session.id, e);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className={`w-full border rounded px-1.5 py-0.5 text-xs focus:outline-none ${
                          isLight
                            ? 'bg-zinc-100 border-black/20 text-zinc-900'
                            : 'bg-[#131314] border-white/20 text-white'
                        }`}
                      />
                    ) : (
                      <span className="truncate">{session.title}</span>
                    )}
                  </div>

                  {/* Actions for editing and deleting */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => saveEditing(session.id, e)}
                          className="p-1 hover:text-emerald-500 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className={`p-1 transition-colors ${isLight ? 'hover:text-zinc-800' : 'hover:text-zinc-200'}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        <button
                          onClick={(e) => startEditing(session, e)}
                          className={`p-1 transition-colors ${isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'}`}
                          title="Redenumește conversația"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className={`p-1 transition-colors ${isLight ? 'text-zinc-500 hover:text-red-500' : 'text-zinc-400 hover:text-red-400'}`}
                          title="Șterge conversația"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area */}
        <div className={`p-3 border-t space-y-2 ${isLight ? 'border-black/5 bg-[#f0f4f9]' : 'border-white/5 bg-[#1e1f20]'}`}>
          {/* Theme switch button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-zinc-100 border-black/10 text-zinc-800 shadow-sm'
                  : 'bg-[#131314] hover:bg-[#282a2c] border-white/10 text-zinc-300'
              }`}
              title={isLight ? 'Comută pe Mod Întunecat' : 'Comută pe Mod Luminos'}
            >
              <div className="flex items-center gap-2">
                {isLight ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-[#9B72CF]" />
                )}
                <span className="text-xs font-semibold">
                  {isLight ? 'Temă Luminoasă' : 'Temă Întunecată'}
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isLight
                  ? 'bg-zinc-100 text-zinc-600 border-black/5'
                  : 'bg-white/5 text-zinc-400 border-white/10'
              }`}>
                {isLight ? 'LIGHT' : 'DARK'}
              </span>
            </button>
          )}

          {/* Admin console button (only for founder / superuser) */}
          {isPrivileged && (
            <button
              onClick={() => {
                onOpenAdmin();
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left cursor-pointer group ${
                isLight
                  ? 'bg-white hover:bg-zinc-100 border-black/10 text-zinc-800 shadow-sm'
                  : 'bg-[#131314] hover:bg-[#282a2c] border-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <TwSparkleIcon size={16} />
                <div>
                  <div className={`text-xs font-bold transition-colors ${
                    isLight ? 'text-zinc-900 group-hover:text-purple-600' : 'text-white group-hover:text-purple-300'
                  }`}>
                    {userRole === 'fondator' ? 'Panou Fondator Tw' : 'Panou Administrator'}
                  </div>
                  <div className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Control Acces & Sistem
                  </div>
                </div>
              </div>
              <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isLight
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-white/5 text-purple-300 border-white/10'
              }`}>
                ADMIN
              </div>
            </button>
          )}

          {/* User profile card & Logout */}
          <div className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs ${
            isLight
              ? 'bg-white border-black/10 text-zinc-900 shadow-sm'
              : 'bg-[#131314] border-white/5 text-white'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#4285F4] to-[#9B72CF] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                {currentUser.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className={`font-semibold truncate text-xs ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {currentUser.name}
                </div>
                <div className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {currentUser.role === 'fondator' ? 'Nelimitat' : `${currentUser.dailyMessageCount}/23 mesaje`}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-zinc-400 hover:text-red-500 hover:bg-black/5' : 'text-zinc-400 hover:text-red-400 hover:bg-white/5'
              }`}
              title="Deconectare"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

