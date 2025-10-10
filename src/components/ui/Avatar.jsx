import React from 'react';

export function Avatar({ className = '', children }) {
  return (
    <div className={`relative inline-block ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover rounded-full"
    />
  );
}

export function AvatarFallback({ className = '', children }) {
  return (
    <div className={`w-full h-full flex items-center justify-center rounded-full ${className}`}>
      {children}
    </div>
  );
}
