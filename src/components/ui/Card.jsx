import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Card component for displaying content in a card layout
 */
export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader component for card headers
 */
export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * CardTitle component for card titles
 */
export function CardTitle({ children, className, ...props }) {
  return (
    <div className={cn('leading-none font-semibold', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * CardDescription component for card descriptions
 */
export function CardDescription({ children, className, ...props }) {
  return (
    <div className={cn('text-muted-foreground text-sm', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * CardContent component for card main content
 */
export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-6', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
