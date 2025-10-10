import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Progress component
 * Displays a horizontal progress bar
 */
export function Progress({ value = 0, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      <div
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}
