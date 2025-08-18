import React from 'react';

const LoadingSkeleton = ({ type = 'card', lines = 3, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`card animate-pulse ${className}`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'stats':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8 mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'chart':
        return (
          <div className={`card ${className}`}>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        );
      
      default:
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        );
    }
  };

  return renderSkeleton();
};

export default LoadingSkeleton;
