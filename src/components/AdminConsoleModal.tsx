import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Brain,
  Zap,
  CheckCircle,
  Plus,
  Trash2,
  Sliders,
  Download,
  Lock,
  Sparkles,
  Users,
  RotateCw,
  Crown,
  Shield,
  GraduationCap,
} from 'lucide-react';
import { UserRole, MemoryItem, UserAccount } from '../types';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  memories: MemoryItem[];
  onAddMemory: (text: string) => void;
  onDeleteMemory: (id: string) => void;
  customPrompt: string;
  onUpdateCustomPrompt: (prompt: string) => void;
  speedPriority: boolean;
  onToggleSpeedPriority: () => void;
  autoVerify: boolean;
  onToggleAutoVerify: () => void;
  onExportAll: () => void;
  registeredUsers?: UserAccount[];
  onUpdateUserRole?: (userId: string, newRole: UserRole) => void;
  onResetUserQuota?: (userId: string) => void;
  theme?: 'dark' | 'light';
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  userRole,
  onChangeRole,
  memories,
  onAddMemory,
  onDeleteMemory,
  customPrompt,
  onUpdateCustomPrompt,
  speedPriority,
  onToggleSpeedPriority,
  autoVerify,
  onToggleAutoVerify,
  onExportAll,
  registeredUsers = [],
  onUpdateUserRole,
  onResetUserQuota,
  theme = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'role' | 'memory' | 'prompt'>('users');
  const [newMemoryInput, setNewMemoryInput] = useState('');

  const isLight = theme === 'light';

  // Strict security: only founder and superuser can access this modal
  if (!isOpen || (userRole !== 'fondator' && userRole !== 'superuser')) return null;

  const handleAdd = () => {
    if (!newMemoryInput.trim()) return;
    onAddMemory(newMemoryInput.trim());
    setNewMemoryInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
        isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-700/80 text-white'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/80 border-zinc-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                <span>{userRole === 'fondator' ? '👑 Panou Special Fondator' : 'Panou Administrator & Acces'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  {userRole === 'fondator' ? 'FONDATOR' : 'ADMIN'}
                </span>
              </div>
              <div className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {userRole === 'fondator'
                  ? 'Controlează cui îi dai acces de administrator, gestionează utilizatorii și memoria'
                  : 'Gestionare parametri tehnici și utilizatori'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>💬 Înapoi la Chat</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-zinc-500 hover:text-black hover:bg-black/5' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Închide meniul"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b px-5 gap-2 pt-2 overflow-x-auto ${
          isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
        }`}>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-amber-500 text-amber-600 dark:text-amber-300 font-bold'
                : isLight
                ? 'border-transparent text-zinc-600 hover:text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Gestionare Acces ({registeredUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('role')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'role'
                ? 'border-cyan-500 text-cyan-600 dark:text-white font-bold'
                : isLight
                ? 'border-transparent text-zinc-600 hover:text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Rol & Viteză
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'border-cyan-500 text-cyan-600 dark:text-white font-bold'
                : isLight
                ? 'border-transparent text-zinc-600 hover:text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Memorie ({memories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'prompt'
                ? 'border-cyan-500 text-cyan-600 dark:text-white font-bold'
                : isLight
                ? 'border-transparent text-zinc-600 hover:text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Instrucțiuni Sistem AI
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 0: GESTIONARE ACCES & UTILIZATORI */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold">Control Acces:</span> Doar persoanele pe care le autorizezi de aici pot primi rol de Administrator/SuperUser. Toți cei care accesează linkul primesc implicit rolul de Elev cu limita standard de 23 mesaje.
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  Utilizatori Înregistrați în Aplicație ({registeredUsers.length})
                </div>

                {registeredUsers.length === 0 ? (
                  <div className="text-xs text-zinc-500 p-4 text-center">
                    Nu există alți utilizatori înregistrați încă.
                  </div>
                ) : (
                  registeredUsers.map((u) => {
                    const isFondatorUser = u.role === 'fondator';
                    const isSuperuser = u.role === 'superuser';
                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isFondatorUser
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : isSuperuser
                            ? 'bg-purple-950/20 border-purple-500/40'
                            : 'bg-zinc-950 border-zinc-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white truncate">
                              {u.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                                isFondatorUser
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : isSuperuser
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 truncate mt-0.5 font-mono">
                            {u.email}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-1">
                            Mesaje: {u.dailyMessageCount} / {isFondatorUser || isSuperuser ? 'Nelimitate' : '23 pe zi'}
                          </div>
                        </div>

                        {/* Action buttons to grant or change access */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {onResetUserQuota && (
                            <button
                              onClick={() => onResetUserQuota(u.id)}
                              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                              title="Resetează contorul de mesaje al utilizatorului la 0"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Reset Cote</span>
                            </button>
                          )}

                          {onUpdateUserRole && !isFondatorUser && (
                            <>
                              {isSuperuser ? (
                                <button
                                  onClick={() => onUpdateUserRole(u.id, 'student')}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Revocă drepturile de administrator"
                                >
                                  Revocă Admin
                                </button>
                              ) : (
                                <button
                                  onClick={() => onUpdateUserRole(u.id, 'superuser')}
                                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                  title="Oferă acces de Administrator acestui utilizator"
                                >
                                  <Shield className="w-3 h-3 text-purple-300" />
                                  <span>Dă Acces SuperUser</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 1: ROL & VITEZĂ */}
          {activeTab === 'role' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">
                  Selectează Rolul Tău în Aplicație
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onChangeRole('fondator')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      userRole === 'fondator'
                        ? 'bg-amber-950/50 border-amber-400 text-white ring-2 ring-amber-500/60 shadow-lg'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <span>👑 Fondator Tw</span>
                    </div>
                    <div className="text-[11px] text-zinc-300 mt-1">
                      Acces suprem deplin, mesaje nelimitate, control complet.
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeRole('superuser')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      userRole === 'superuser'
                        ? 'bg-purple-950/40 border-purple-500/80 text-white ring-1 ring-purple-500/50 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="font-bold text-xs text-purple-300 flex items-center gap-1">
                      <span>⚡ SuperUser / Administrator</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Acces tehnic, reglare memorie și viteză sub 1 secundă.
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeRole('teacher')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      (userRole as string) === 'teacher'
                        ? 'bg-emerald-950/40 border-emerald-500/80 text-white ring-1 ring-emerald-500/50 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-300">
                      👨‍🏫 Profesor / Mentor
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Răspunsuri pedagogice pas cu pas, metodologie școlară.
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeRole('student')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      (userRole as string) === 'student'
                        ? 'bg-cyan-950/40 border-cyan-500/80 text-white ring-1 ring-cyan-500/50 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="font-bold text-xs text-cyan-300">
                      🎓 Elev / Copil (Standard)
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      23 mesaje zilnice, mod strict educativ și protejat.
                    </div>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                {/* 1 sec response speed toggle */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Viteză Răspuns Sub 1 Secundă (Ultra-Fast)
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Streaming SSE în timp real + latență minimă
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onToggleSpeedPriority}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      speedPriority ? 'bg-cyan-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        speedPriority ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Double verification toggle */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        2 Verificări Automate la Fiecare Răspuns
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Evaluare automată a acurateței și siguranței
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onToggleAutoVerify}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      autoVerify ? 'bg-emerald-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        autoVerify ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Export backup button */}
              <div className="pt-2">
                <button
                  onClick={onExportAll}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Descarcă Backup Complet (Conversații + Memorie JSON)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MEMORIE */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 leading-relaxed">
                Asistentul reține aceste informații în permanență pentru a oferi răspunsuri hiper-personalizate.
              </div>

              {/* Add Memory Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemoryInput}
                  onChange={(e) => setNewMemoryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Ex: Îmi plac explicațiile cu exemple practice..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={handleAdd}
                  disabled={!newMemoryInput.trim()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adaugă</span>
                </button>
              </div>

              {/* Memory List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {memories.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    Nu ai nicio amintire salvată. Adaugă una mai sus!
                  </div>
                ) : (
                  memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 group hover:border-zinc-700 transition-colors"
                    >
                      <span className="text-xs text-zinc-200 pr-2">
                        {mem.text}
                      </span>
                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Șterge amintirea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PROMPT OVERRIDE */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 block mb-1">
                  Suprascriere Instrucțiuni de Bază (System Prompt)
                </label>
                <p className="text-xs text-zinc-400 mb-2 leading-relaxed">
                  Ca Fondator / SuperUser, poți defini exact comportamentul dorit al AI-ului. Lasă necompletat pentru a folosi configurarea automată.
                </p>
                <textarea
                  value={customPrompt}
                  onChange={(e) => onUpdateCustomPrompt(e.target.value)}
                  placeholder="Scrie instrucțiuni avansate personalizate pentru Gemini..."
                  rows={6}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono leading-relaxed resize-none"
                />
              </div>

              {customPrompt && (
                <button
                  onClick={() => onUpdateCustomPrompt('')}
                  className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Resetează la promptul implicit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 font-mono">
            Mod: <span className="text-amber-400">{userRole.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/20 active:scale-98"
            >
              💬 Mergi în Chat
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Închide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
