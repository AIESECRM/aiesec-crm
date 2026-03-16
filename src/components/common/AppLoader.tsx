import React from 'react';


type AppLoaderProps = {
  label?: string;
  fullScreen?: boolean;
  showSkeleton?: boolean;
  skeletonCount?: number;
};

export default function AppLoader({
  label = 'Yukleniyor...',
  fullScreen = false,
  showSkeleton = false,
  skeletonCount = 6,
}: AppLoaderProps) {
  return (
    <div
      className={fullScreen ? 'app-loader-screen' : 'app-loader-inline'}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="app-loader-brand" aria-hidden="true">
        <div className="app-loader-orbit" />
        <div className="app-loader-core" />
      </div>
      <p className="app-loader-text">{label}</p>

      {showSkeleton && (
        <div className="app-skeleton-grid" aria-hidden="true">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div key={index} className="app-skeleton-card">
              <div className="app-skeleton-line app-skeleton-line--lg" />
              <div className="app-skeleton-line app-skeleton-line--md" />
              <div className="app-skeleton-line app-skeleton-line--sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
