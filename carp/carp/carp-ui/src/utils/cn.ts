import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names
 * Simple class name concatenation utility for conditional styling
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}