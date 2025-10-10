import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Badge component for displaying small labels
 * @param {'default'|'success'|'warning'|'error'|'info'} variant - Badge color variant
 */
export function Badge({ variant = 'default', children, className, ...props }) {
  const variants = {
    default: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
