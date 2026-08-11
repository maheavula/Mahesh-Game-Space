import React from 'react';

export const SkeletonGameGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="glass-panel p-3.5 rounded-2xl animate-pulse space-y-3">
          <div className="aspect-[3/4] bg-slate-800 rounded-xl w-full" />
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-800 rounded w-1/2" />
          <div className="h-10 bg-slate-800 rounded-xl w-full pt-2" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4 animate-pulse">
      <div className="h-6 bg-slate-800 rounded w-1/4 mb-6" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-12 bg-slate-800/60 rounded-xl w-full" />
      ))}
    </div>
  );
};
