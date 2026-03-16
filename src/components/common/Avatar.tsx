'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Resmin durumunu anında kontrol etmek için bir referans oluşturuyoruz
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setError(false);
    setRetryCount(0);
    setIsLoading(true);
  }, [src]);

  // Eğer resim tarayıcı önbelleğinden (cache) anında geldiyse, yükleme durumunu kapat
  useEffect(() => {
    if (imgRef.current?.complete && src) {
      setIsLoading(false);
    }
  }, [src]);

  const handleImageError = () => {
    console.warn(`[Avatar] Resim yüklenemedi, tekrar deneniyor (${retryCount + 1}/2):`, src);
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
      }, 2000);
    } else {
      console.error(`[Avatar] Resim yükleme başarısız oldu:`, src);
      setError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const containerStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    ...style
  };

  const imageSrc = src || '';

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
      className={cn("relative rounded-full border border-border overflow-hidden bg-gray-100 dark:bg-gray-800", className)}
      style={containerStyle}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackIcon || <UserIcon size={typeof size === 'number' ? size * 0.6 : 24} className="text-muted-foreground opacity-50 animate-pulse" />}
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt || "Avatar"}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}
