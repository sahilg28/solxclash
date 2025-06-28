import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  rows?: number;
  height?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  rows = 1, 
  height = 'h-4' 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div 
          key={index} 
          className={`skeleton ${height} w-full mb-2 last:mb-0`}
        />
      ))}
    </div>
  );
};

export const TableSkeletonLoader: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-20" />
        </div>
      ))}
    </div>
  );
};

export const CardSkeletonLoader: React.FC = () => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-4/6" />
      </div>
    </div>
  );
};

export default SkeletonLoader;