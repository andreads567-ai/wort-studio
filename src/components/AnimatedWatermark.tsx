import React, { useMemo } from 'react';
import logoImg from '../assets/logo.png';
import logoIconImg from '../assets/logo-icon.png';

interface AnimatedWatermarkProps {
  /** Opacity of the watermark layer, between 0.05 and 0.15 (default: 0.08) */
  opacity?: number;
  /** Custom CSS classes for positioning */
  className?: string;
  /** Base animation speed multiplier (default: 1) */
  speedMultiplier?: number;
}

interface ColumnConfig {
  id: number;
  direction: 'up' | 'down';
  duration: number; // in seconds
  responsiveClass: string;
}

const COLUMNS_CONFIG: ColumnConfig[] = [
  { id: 0, direction: 'down', duration: 32, responsiveClass: 'flex' },
  { id: 1, direction: 'up', duration: 26, responsiveClass: 'flex' },
  { id: 2, direction: 'down', duration: 36, responsiveClass: 'flex' },
  { id: 3, direction: 'up', duration: 28, responsiveClass: 'flex' },
  { id: 4, direction: 'down', duration: 34, responsiveClass: 'hidden sm:flex' },
  { id: 5, direction: 'up', duration: 25, responsiveClass: 'hidden sm:flex' },
  { id: 6, direction: 'down', duration: 38, responsiveClass: 'hidden md:flex' },
  { id: 7, direction: 'up', duration: 29, responsiveClass: 'hidden md:flex' },
  { id: 8, direction: 'down', duration: 33, responsiveClass: 'hidden lg:flex' },
  { id: 9, direction: 'up', duration: 27, responsiveClass: 'hidden lg:flex' },
  { id: 10, direction: 'down', duration: 35, responsiveClass: 'hidden xl:flex' },
  { id: 11, direction: 'up', duration: 30, responsiveClass: 'hidden xl:flex' },
];

// 12 watermark units per set (24 total per column for an infinite seamless cycle)
const WATERMARK_ITEMS = Array.from({ length: 12 }, (_, i) => i);

export const AnimatedWatermark: React.FC<AnimatedWatermarkProps> = ({
  opacity = 0.08,
  className = '',
  speedMultiplier = 1,
}) => {
  // Memoize rendered watermark entry with the new official logo
  const renderWatermarkUnit = (key: string | number) => (
    <div
      key={key}
      className="py-10 sm:py-14 flex items-center justify-center shrink-0"
    >
      <div className="inline-flex items-center transform -rotate-90 select-none whitespace-nowrap cursor-default">
        {/* Official New Logo: Ribbon 'W' + Wort STUDIO */}
        <img
          src={logoImg}
          alt="Wort STUDIO"
          aria-hidden="true"
          className="h-6 sm:h-7 w-auto object-contain brightness-125 contrast-125 drop-shadow-[0_0_12px_rgba(8,102,255,0.4)]"
          loading="lazy"
        />
      </div>
    </div>
  );

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* Container holding parallel vertical watermark columns */}
      <div className="w-full h-full flex justify-around items-stretch">
        {COLUMNS_CONFIG.map((col) => {
          const isUp = col.direction === 'up';
          const calculatedDuration = col.duration / speedMultiplier;

          return (
            <div
              key={col.id}
              className={`flex-1 max-w-[120px] sm:max-w-[150px] overflow-hidden flex-col justify-start items-center ${col.responsiveClass}`}
            >
              {/* Animated Track with duplicated sets for seamless infinite loop */}
              <div
                className={`w-full flex flex-col items-center ${
                  isUp ? 'animate-watermark-up' : 'animate-watermark-down'
                }`}
                style={{
                  animationDuration: `${calculatedDuration}s`,
                }}
              >
                {/* First Set of Items */}
                <div className="w-full flex flex-col items-center">
                  {WATERMARK_ITEMS.map((item) =>
                    renderWatermarkUnit(`set1-${col.id}-${item}`)
                  )}
                </div>

                {/* Second Duplicate Set of Items (Seamless Continuation) */}
                <div className="w-full flex flex-col items-center">
                  {WATERMARK_ITEMS.map((item) =>
                    renderWatermarkUnit(`set2-${col.id}-${item}`)
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
