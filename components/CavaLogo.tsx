'use client';

import React from 'react';

export interface CavaVMarkProps {
  size?: number | string;
  height?: number | string;
  className?: string;
  light?: boolean;
}

export function CavaVMark({ size, height, className = '', light = false }: CavaVMarkProps) {
  const dimension = height || size || 36;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="CAVA V Emblem"
    >
      {/* Upper Inverted Triangle in Pastel Blue (#A9D3C5) */}
      <polygon
        points="30,22 70,22 50,42"
        fill="#A9D3C5"
      />
      {/* Lower Chevron Wing in Teal Blue (#307B8E) */}
      <path
        d="M20,24 L38,24 L50,68 L62,24 L80,24 L56,82 C53.5,87 46.5,87 44,82 Z"
        fill="#307B8E"
      />
    </svg>
  );
}

export interface CavaLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  height?: number;
  showSubtitle?: boolean;
  light?: boolean;
}

export function CavaLogo({
  className = '',
  variant = 'full',
  size = 'md',
  height,
  showSubtitle = true,
  light = false,
}: CavaLogoProps) {
  const markHeight = height || (size === 'sm' ? 24 : size === 'md' ? 36 : size === 'lg' ? 48 : 64);

  if (variant === 'mark') {
    return <CavaVMark size={markHeight} className={className} light={light} />;
  }

  // Horizontal lockup (Emblem + CAVA + CASH VALUE)
  if (variant === 'horizontal' || variant === 'full') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div className="flex items-center justify-center rounded-xl bg-[#103A57] p-1.5 shadow-sm border border-white/10">
          <CavaVMark size={Math.round(markHeight * 0.85)} />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center tracking-wider">
            <span className={`font-black text-lg sm:text-xl tracking-[0.2em] leading-none ${light ? 'text-white' : 'text-[#103A57]'}`}>
              CA
            </span>
            <span className="inline-block mx-0.5" style={{ width: 14, height: 14 }}>
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <polygon points="30,22 70,22 50,42" fill="#A9D3C5" />
                <path d="M20,24 L38,24 L50,68 L62,24 L80,24 L56,82 C53.5,87 46.5,87 44,82 Z" fill="#307B8E" />
              </svg>
            </span>
            <span className={`font-black text-lg sm:text-xl tracking-[0.2em] leading-none ${light ? 'text-white' : 'text-[#103A57]'}`}>
              A
            </span>
          </div>
          {showSubtitle && (
            <span className={`text-[8.5px] font-bold tracking-[0.24em] uppercase mt-0.5 ${light ? 'text-[#A9D3C5]' : 'text-[#307B8E]'}`}>
              Cash Value
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center text-center ${className}`}>
      <CavaVMark size={markHeight * 1.2} />
      <span className={`text-2xl font-black tracking-[0.25em] leading-tight mt-1 ${light ? 'text-white' : 'text-[#103A57]'}`}>
        CAVA
      </span>
      {showSubtitle && (
        <span className={`text-[10px] font-extrabold tracking-[0.28em] uppercase mt-0.5 ${light ? 'text-[#A9D3C5]' : 'text-[#307B8E]'}`}>
          Cash Value
        </span>
      )}
    </div>
  );
}

export default CavaLogo;
