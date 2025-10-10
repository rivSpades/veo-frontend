import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

/**
 * Popover component - Floating content container
 */

const PopoverContext = createContext(null);

export function Popover({ children, open: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ asChild, className, children, ...props }) {
  const context = useContext(PopoverContext);

  const handleClick = () => {
    context?.onOpenChange?.(!context.open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <button type="button" onClick={handleClick} className={className} {...props}>
      {children}
    </button>
  );
}

export function PopoverContent({ className, align = 'center', sideOffset = 4, children, ...props }) {
  const context = useContext(PopoverContext);
  const ref = useRef(null);

  useEffect(() => {
    if (!context?.open) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        context.onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [context]);

  if (!context?.open) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-[100] mt-2 w-72 rounded-lg border bg-white p-4 shadow-lg outline-none',
        alignmentClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
