/**
 * Utility helper to conditionally join class names (shadcn-style)
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}
