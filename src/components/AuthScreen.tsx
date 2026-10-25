import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { UserAccount } from '../types';
import { TwLogo } from './TwLogo';

interface AuthScreenProps {
  onLogin: (user: UserAccount, target?: 'chat' | 'founder_menu') => void;
  registeredUsers: UserAccount[];
  onRegister: (newUser: UserAccount) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  registeredUsers,
  onRegister,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLight = theme === 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setErrorMessage('Te rugăm să introduci adresa de email.');
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage('Te rugăm să introduci parola.');
      return;
    }

    if (isRegisterMode) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setErrorMessage('Te rugăm să introduci numele tău complet.');
        return;
      }
      if (trimmedPassword.length < 3) {
        setErrorMessage('Parola trebuie să aibă minim 3 caractere.');
        return;
      }

      if (trimmedEmail === 'alexandrustanescu583@gmail.com') {
        setErrorMessage('Acest cont aparține Fondatorului. Te rugăm să comuți pe Autentificare.');
        return;
      }

      const existing = registeredUsers.find(
        (u) => u.email.toLowerCase() === trimmedEmail
      );
      if (existing) {
        setErrorMessage('Există deja un cont înregistrat cu acest email. Te rugăm să te conectezi.');
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        role: 'student',
        dailyMessageCount: 0,
        lastMessageDate: today,
        maxDailyMessages: 23,
        createdAt: Date.now(),
      };

      onRegister(newUser);
      onLogin(newUser, 'chat');
    } else {
      if (trimmedEmail === 'alexandrustanescu583@gmail.com') {
        const founderUser = registeredUsers.find(
          (u) => u.email.toLowerCase() === 'alexandrustanescu583@gmail.com'
        );
        const expectedPassword = founderUser?.password || 'admin';
        if (trimmedPassword !== expectedPassword) {
          setErrorMessage('Parolă incorectă pentru contul de Fondator.');
          return;
        }

        const authenticatedFounder: UserAccount = founderUser
          ? { ...founderUser, role: 'fondator' }
          : {
              id: 'user-founder-1',
              name: 'Alexandru Stănescu',
              email: 'alexandrustanescu583@gmail.com',
              password: 'admin',
              role: 'fondator',
              dailyMessageCount: 0,
              lastMessageDate: new Date().toISOString().slice(0, 10),
              maxDailyMessages: 23,
              createdAt: Date.now(),
            };

        onLogin(authenticatedFounder, 'chat');
        return;
      }

      const found = registeredUsers.find(
        (u) =>
          u.email.toLowerCase() === trimmedEmail ||
          u.name.toLowerCase() === trimmedEmail
      );

      if (!found) {
        setErrorMessage('Nu am găsit niciun cont cu aceste date. Selectează „Cont Nou” pentru a te înregistra.');
        return;
      }

      if (found.password && found.password !== trimmedPassword) {
        setErrorMessage('Parolă incorectă. Te rugăm să încerci din nou.');
        return;
      }

      onLogin(found, 'chat');
    }
  };

  return (
    <div className={`min-h-[100dvh] w-screen flex flex-col justify-center items-center p-4 selection:bg-[#9B72CF]/30 selection:text-white relative transition-colors ${
      isLight ? 'bg-[#f0f4f9] text-[#1f1f1f]' : 'bg-[#131314] text-[#e3e3e3]'
    }`}>
      {/* Top right theme switcher */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer border shadow-sm ${
              isLight
                ? 'bg-white hover:bg-zinc-100 text-zinc-800 border-black/10'
                : 'bg-[#1e1f20] hover:bg-[#282a2c] text-zinc-300 border-white/10'
            }`}
            title={isLight ? 'Comută pe Mod Întunecat' : 'Comută pe Mod Luminos'}
          >
            {isLight ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Mod Luminos</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#9B72CF]" />
                <span>Mod Întunecat</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl border ${
        isLight
          ? 'bg-white border-black/10'
          : 'bg-[#1e1f20] border-white/10'
      }`}>
        {/* Subtle Gemini Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#4285F4]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#9B72CF]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo and Brand */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <TwLogo size={64} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-[#4285F4] via-[#9B72CF] to-[#D96570] bg-clip-text text-transparent">
              Tw
            </span>
          </h1>
          <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Asistent AI rapid și inteligent · Inspirat de Gemini
          </p>
        </div>

        {/* Tab Toggle: Autentificare / Cont Nou */}
        <div className={`grid grid-cols-2 p-1 rounded-2xl border mb-5 text-xs font-semibold ${
          isLight ? 'bg-zinc-100 border-black/5' : 'bg-[#131314] border-white/5'
        }`}>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              !isRegisterMode
                ? isLight
                  ? 'bg-white text-zinc-900 shadow-sm font-bold border border-black/5'
                  : 'bg-[#282a2c] text-white shadow-sm font-bold'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Autentificare
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              isRegisterMode
                ? isLight
                  ? 'bg-white text-zinc-900 shadow-sm font-bold border border-black/5'
                  : 'bg-[#282a2c] text-white shadow-sm font-bold'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cont Nou
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegisterMode && (
            <div>
              <label className={`text-[11px] font-medium block mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-400'}`}>
                Nume Complet
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Alexandru"
                  className={`w-full border rounded-2xl pl-10 pr-3.5 py-3 text-sm focus:outline-none transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-black/10 text-zinc-900 placeholder-zinc-400 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]/30'
                      : 'bg-[#131314] border-white/10 text-white placeholder-zinc-500 focus:border-[#9B72CF] focus:ring-1 focus:ring-[#9B72CF]/50'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`text-[11px] font-medium block mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-400'}`}>
              Adresă de Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adresa@exemplu.ro"
                autoComplete="email"
                className={`w-full border rounded-2xl pl-10 pr-3.5 py-3 text-sm focus:outline-none transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-black/10 text-zinc-900 placeholder-zinc-400 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]/30'
                    : 'bg-[#131314] border-white/10 text-white placeholder-zinc-500 focus:border-[#9B72CF] focus:ring-1 focus:ring-[#9B72CF]/50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`text-[11px] font-medium block mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-400'}`}>
              Parolă
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                className={`w-full border rounded-2xl pl-10 pr-3.5 py-3 text-sm focus:outline-none transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-black/10 text-zinc-900 placeholder-zinc-400 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]/30'
                    : 'bg-[#131314] border-white/10 text-white placeholder-zinc-500 focus:border-[#9B72CF] focus:ring-1 focus:ring-[#9B72CF]/50'
                }`}
              />
            </div>
          </div>

          {errorMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-2xl border text-xs animate-fadeIn ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-zinc-800/90 border-zinc-700 text-zinc-200'
            }`}>
              <Info className="w-4 h-4 shrink-0 text-cyan-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-[#4285F4] via-[#9B72CF] to-[#D96570] hover:opacity-95 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#9B72CF]/20 active:scale-98 mt-2"
          >
            <span>{isRegisterMode ? 'Creează Contul' : 'Conectare'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Daily limit note */}
        <div className="mt-5 text-center">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] ${
            isLight
              ? 'bg-zinc-100 border-black/5 text-zinc-600'
              : 'bg-[#131314] border-white/5 text-zinc-400'
          }`}>
            <Clock className="w-3 h-3 text-[#4285F4]" />
            <span>23 de mesaje zilnice pentru conturile standard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
