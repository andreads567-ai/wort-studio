import React from 'react';

interface SuccessCheckmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  size = 'lg',
  className = ''
}) => {
  const dimensions = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-28 h-28 sm:w-32 sm:h-32'
  }[size];

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer ripple wave expanding outwards around the circle */}
      <div className={`absolute ${dimensions} rounded-full border-2 border-emerald-400/50 animate-success-pulse pointer-events-none`} />

      {/* Secondary soft ambient glow behind the circle */}
      <div className={`absolute ${dimensions} rounded-full bg-emerald-500/20 blur-xl pointer-events-none`} />

      {/* Main Container */}
      <div className={`relative ${dimensions} rounded-full bg-[#061B16] border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-950/80 animate-success-glow overflow-visible`}>
        {/* SVG Drawing Circle and Checkmark V */}
        <svg
          className="w-full h-full p-2.5 overflow-visible"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle background track circle */}
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="rgba(16, 185, 129, 0.18)"
            strokeWidth="5"
          />

          {/* Animated Green Circle Drawing Around (Círculo Verde ao redor do círculo) */}
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="#10B981"
            strokeWidth="5.5"
            strokeLinecap="round"
            className="animate-success-circle"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.75))'
            }}
          />

          {/* Animated Checkmark "V" (Sinal de V verde) */}
          <path
            d="M 37 62 L 53 77 L 85 43"
            fill="none"
            stroke="#10B981"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-success-check"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.85))'
            }}
          />
        </svg>
      </div>
    </div>
  );
};
