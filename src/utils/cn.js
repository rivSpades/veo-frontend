/**
 * Utility function to merge Tailwind CSS classes
 * Simple className merger that handles conditional classes
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default cn;
