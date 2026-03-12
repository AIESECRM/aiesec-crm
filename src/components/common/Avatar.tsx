'use client';

import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  fallbackIcon?: React.ReactNode;
}

export default function Avatar({ src, alt, size = 40, className, style, fallbackIcon }: AvatarProps) {
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setError(false);
  }, [src]);

  const containerStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    ...style
  };

  if (!src || error) {
    return (
      <div 
        className={cn("flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full border border-border overflow-hidden", className)}
        style={containerStyle}
      >
        {fallbackIcon || <UserIcon size={typeof size === 'number' ? size * 0.6 : 24} className="text-muted-foreground" />}
      </div>
    );
  }

  return (
    <div 
      className={cn("rounded-full border border-border overflow-hidden", className)}
      style={containerStyle}
    >
      <img
        src={src}
        alt={alt || "Avatar"}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
