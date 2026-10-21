import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  theme?: 'dark' | 'light';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, theme = 'dark' }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const isLight = theme === 'light';

  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`space-y-3 leading-relaxed text-sm sm:text-base ${isLight ? 'text-[#1f1f1f]' : 'text-zinc-100'}`}>
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          let language = 'text';
          let codeContent = '';

          if (firstLineEnd !== -1) {
            language = part.slice(3, firstLineEnd).trim() || 'code';
            codeContent = part.slice(firstLineEnd + 1, -3);
          } else {
            codeContent = part.slice(3, -3);
          }

          return (
            <div
              key={index}
              className={`my-3 rounded-2xl overflow-hidden font-mono text-xs sm:text-sm shadow-md border ${
                isLight
                  ? 'border-zinc-200/80 bg-zinc-950 text-zinc-100'
                  : 'border-zinc-700/80 bg-zinc-950 text-zinc-100'
              }`}
            >
              <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
                  {language}
                </span>
                <button
                  onClick={() => handleCopyCode(codeContent, index)}
                  className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  {copiedCodeIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-sans">Copiat!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="font-sans">Copiază codul</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-zinc-200 leading-relaxed font-mono whitespace-pre selection:bg-purple-500/30">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Render regular markdown text
        return <FormattedParagraph key={index} text={part} isLight={isLight} />;
      })}
    </div>
  );
};

interface FormattedParagraphProps {
  text: string;
  isLight: boolean;
}

const FormattedParagraph: React.FC<FormattedParagraphProps> = ({ text, isLight }) => {
  if (!text.trim()) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className={`text-base font-bold mt-3 mb-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {formatInline(line.slice(4), isLight)}
            </h4>
          );
        }
        // Header ##
        if (line.startsWith('## ')) {
          return (
            <h3 key={idx} className={`text-lg font-bold mt-4 mb-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {formatInline(line.slice(3), isLight)}
            </h3>
          );
        }
        // Header #
        if (line.startsWith('# ')) {
          return (
            <h2 key={idx} className={`text-xl font-extrabold mt-4 mb-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {formatInline(line.slice(2), isLight)}
            </h2>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2">
              <span className={`font-bold select-none leading-relaxed ${isLight ? 'text-[#4285F4]' : 'text-cyan-400'}`}>
                •
              </span>
              <span className={`flex-1 ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                {formatInline(trimmed.slice(2), isLight)}
              </span>
            </div>
          );
        }

        // Numbered list (e.g. 1. 2. 3.)
        const matchNumber = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (matchNumber) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2">
              <span className={`font-mono text-xs font-semibold pt-0.5 select-none tabular-nums ${isLight ? 'text-[#4285F4]' : 'text-cyan-400'}`}>
                {matchNumber[1]}.
              </span>
              <span className={`flex-1 ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                {formatInline(matchNumber[2], isLight)}
              </span>
            </div>
          );
        }

        // Regular line
        return (
          <p key={idx} className={`leading-relaxed ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
            {formatInline(line, isLight)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Format bold **text**, inline `code`, and italics *text*
 */
function formatInline(str: string, isLight: boolean): React.ReactNode[] {
  // Regex splitting by bold (**text**) and code (`text`)
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={`font-semibold ${isLight ? 'text-zinc-950' : 'text-white'}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs border ${
            isLight
              ? 'bg-zinc-100 text-purple-700 border-zinc-200'
              : 'bg-zinc-800 text-cyan-300 border-zinc-700/60'
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

