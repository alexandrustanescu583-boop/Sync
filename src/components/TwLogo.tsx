import React, { useId } from 'react';

interface TwLogoProps {
  className?: string;
  size?: number;
  withGlow?: boolean;
}

export const TwLogo: React.FC<TwLogoProps> = ({
  className = '',
  size = 32,
  withGlow = true,
}) => {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `twGrad_${rawId}`;
  const sparkGradId = `sparkGrad_${rawId}`;
  const glowFilterId = `twGlow_${rawId}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title="Tw AI"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        <defs>
          {/* Signature Gemini Iridescent Gradient (Blue -> Violet -> Pink) */}
          <linearGradient id={gradId} x1="15" y1="15" x2="105" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="45%" stopColor="#9B72CF" />
            <stop offset="85%" stopColor="#D96570" />
            <stop offset="100%" stopColor="#FF7D54" />
          </linearGradient>

          {/* Gemini Sparkle Gradient */}
          <linearGradient id={sparkGradId} x1="75" y1="10" x2="115" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9B72CF" />
            <stop offset="50%" stopColor="#4285F4" />
            <stop offset="100%" stopColor="#D96570" />
          </linearGradient>

          {/* Filter for subtle glow */}
          {withGlow && (
            <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#9B72CF" floodOpacity="0.45" />
            </filter>
          )}
        </defs>

        {/* Soft Background Pill / Squircle */}
        <rect
          x="4"
          y="4"
          width="112"
          height="112"
          rx="28"
          fill="#1E1F20"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="2"
        />

        {/* Inner ambient glow */}
        <circle cx="60" cy="60" r="42" fill="url(#twGrad)" fillOpacity="0.08" />

        {/* Group with Tw Letters & Gemini Spark */}
        <g filter={withGlow ? `url(#${glowFilterId})` : undefined}>
          {/* Letter "T" */}
          {/* Top Bar of T */}
          <rect x="22" y="34" width="34" height="8.5" rx="4.25" fill={`url(#${gradId})`} />
          {/* Stem of T */}
          <rect x="35" y="34" width="8.5" height="48" rx="4.25" fill={`url(#${gradId})`} />

          {/* Letter "w" */}
          {/* First downstroke */}
          <path
            d="M 58 48 L 65 78 C 65.5 80.5 68.5 81 70 79 L 75.5 60 C 76 58.5 78 58.5 78.5 60 L 84 79 C 85.5 81 88.5 80.5 89 78 L 96 48"
            stroke={`url(#${gradId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gemini 4-Point Star Sparkle on top-right */}
          <path
            d="M 96 14 C 96 22 90 27 82 27 C 90 27 96 32 96 40 C 96 32 102 27 110 27 C 102 27 96 22 96 14 Z"
            fill={`url(#${sparkGradId})`}
          />
        </g>
      </svg>
    </div>
  );
};

export const TwSparkleIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="twSparkGradInline" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B72CF" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        d="M 12 2 C 12 7.5 7.5 12 2 12 C 7.5 12 12 16.5 12 22 C 12 16.5 16.5 12 22 12 C 16.5 12 12 7.5 12 2 Z"
        fill="url(#twSparkGradInline)"
      />
    </svg>
  );
};
