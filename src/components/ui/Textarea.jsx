import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Textarea component for multi-line text input
 */
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'disabled:bg-secondary-100 disabled:cursor-not-allowed',
        'resize-vertical min-h-[80px]',
        className
      )}
      {...props}
    />
  );
}

export default Textarea;
