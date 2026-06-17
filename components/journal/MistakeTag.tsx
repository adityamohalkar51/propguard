// components/journal/MistakeTag.tsx
'use client';

import React from 'react';

interface MistakeTagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  color?: string;
  size?: 'sm' | 'md';
}

export default function MistakeTag({
  label,
  selected = false,
  onClick,
  color = '#E24B4A',
  size = 'md',
}: MistakeTagProps) {
  const baseClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px]' 
    : 'px-2.5 py-1 text-xs';
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${baseClasses}
        rounded-full border transition-all duration-150
        ${selected 
          ? 'border-opacity-100 text-white' 
          : 'border-opacity-30 text-[#888780] hover:border-opacity-60'
        }
      `}
      style={{
        borderColor: selected ? color : undefined,
        backgroundColor: selected ? `${color}30` : 'transparent',
      }}
    >
      {label}
    </button>
  );
}