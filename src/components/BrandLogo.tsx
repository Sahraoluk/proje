import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'w-11 h-11' }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 drop-shadow-[0_0_12px_rgba(232,160,178,0.42)] ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label="Ankara Yaşam & Güvenlik Atlası Logosu"
      >
        <defs>
          <linearGradient id="atlasFrameGrad" x1="10" y1="4" x2="54" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f3c1cd" />
            <stop offset="48%" stopColor="#e8a0b2" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
          <linearGradient id="atakuleDomeGrad" x1="23" y1="14" x2="41" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f3c1cd" />
            <stop offset="100%" stopColor="#d8839a" />
          </linearGradient>
          <linearGradient id="atakuleShaftGrad" x1="32" y1="26" x2="32" y2="49" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>

        {/* Outer Pin + Security Shield Frame */}
        <path
          d="M32 3.5 L53.5 11.2 V26.8 C53.5 41.2 43.2 52.3 32 59.8 C20.8 52.3 10.5 41.2 10.5 26.8 V11.2 L32 3.5 Z"
          fill="#061317"
          stroke="url(#atlasFrameGrad)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Inner Geometric Shield/Coordinate Border */}
        <path
          d="M32 7.5 L49.5 13.8 V26.5 C49.5 38.6 40.9 48.2 32 54.6 C23.1 48.2 14.5 38.6 14.5 26.5 V13.8 L32 7.5 Z"
          fill="none"
          stroke="#e8a0b2"
          strokeOpacity="0.32"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Minimalist Map & Compass Coordinate Lines */}
        <circle
          cx="32"
          cy="29"
          r="13.5"
          stroke="#2dd4bf"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <line x1="15" y1="33" x2="25" y2="33" stroke="#e8a0b2" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="39" y1="33" x2="49" y2="33" stroke="#e8a0b2" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M19 41.5 Q32 45.5 45 41.5" stroke="#2dd4bf" strokeOpacity="0.32" strokeWidth="1" fill="none" />

        {/* Atakule Silhouette */}
        {/* Spire & Beacon */}
        <line x1="32" y1="10.5" x2="32" y2="16" stroke="#f3c1cd" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="32" cy="10" r="1.4" fill="#f3c1cd" />

        {/* Atakule Upper Cupola */}
        <path
          d="M27.8 19.2 C27.8 16.4 36.2 16.4 36.2 19.2 Z"
          fill="url(#atakuleDomeGrad)"
        />

        {/* Atakule Observation Deck Saucer */}
        <ellipse
          cx="32"
          cy="21"
          rx="8.8"
          ry="3.1"
          fill="#061317"
          stroke="url(#atakuleDomeGrad)"
          strokeWidth="1.8"
        />
        <line x1="25.5" y1="21" x2="38.5" y2="21" stroke="#2dd4bf" strokeOpacity="0.85" strokeWidth="1" strokeLinecap="round" />

        {/* Under-deck Funnel */}
        <path
          d="M26 23.2 L29.6 26.8 H34.4 L38 23.2"
          fill="none"
          stroke="#e8a0b2"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Tapered Tower Shaft */}
        <path
          d="M30.2 26.8 L28.7 45.5 H35.3 L33.8 26.8 Z"
          fill="url(#atakuleShaftGrad)"
          stroke="#2dd4bf"
          strokeWidth="0.9"
        />
        <line x1="32" y1="27.2" x2="32" y2="45" stroke="#061317" strokeOpacity="0.55" strokeWidth="1" />

        {/* Architectural Base */}
        <line x1="23.5" y1="45.8" x2="40.5" y2="45.8" stroke="#e8a0b2" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="26.5" y1="48.5" x2="37.5" y2="48.5" stroke="#2dd4bf" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
};
