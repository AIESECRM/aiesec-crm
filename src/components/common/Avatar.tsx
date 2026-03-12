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
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    setError(false);
    setRetryCount(0);
  }, [src]);

  const handleImageError = () => {
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 1000); // 1 saniye sonra tekrar dene
    } else {
      setError(true);
    }
  };

  const containerStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    ...style
  };

  const imageSrc = src && retryCount > 0 ? `${src}${src.includes('?') ? '&' : '?'}retry=${retryCount}` : src;

  if (!src || error) {
    return (
      <div 
        key={String(src || 'no-src')}
        className={cn("flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full border border-border overflow-hidden", className)}
        style={containerStyle}
      >
        {fallbackIcon || <UserIcon size={typeof size === 'number' ? size * 0.6 : 24} className="text-muted-foreground" />}
      </div>
    );
  }

  return (
    <div 
      key={String(src)}
      className={cn("rounded-full border border-border overflow-hidden", className)}
      style={containerStyle}
    >
      <img
        src={imageSrc || ''}
        alt={alt || "Avatar"}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    </div>
  );
}
