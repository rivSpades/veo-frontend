import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Select component for dropdown selections
 */
export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'flex w-full px-3 py-2 text-sm rounded-md border border-input bg-background shadow-xs',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'appearance-none bg-right bg-no-repeat',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export default Select;
