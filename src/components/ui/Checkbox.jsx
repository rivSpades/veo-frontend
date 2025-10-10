import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Checkbox component
 */
export function Checkbox({ className, checked, onCheckedChange, disabled, ...props }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={cn(
        'peer size-4 shrink-0 rounded-[4px] border shadow-sm transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'bg-primary text-primary-foreground border-primary'
          : 'border-input',
        className
      )}
      {...props}
    >
      {checked && (
        <div className="flex items-center justify-center text-current transition-none">
          <Check className="size-3.5" />
        </div>
      )}
    </button>
  );
}
