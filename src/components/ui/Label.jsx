import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Label component for form inputs
 */
export function Label({ className, children, required, ...props }) {
  return (
    <label
      className={cn('block text-sm font-medium text-secondary-700 mb-1', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export default Label;
