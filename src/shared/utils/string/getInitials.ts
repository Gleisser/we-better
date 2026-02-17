/**
 * Generate initials from a full name or identifier.
 * @param name The raw string to derive initials from.
 * @param maxLength Optional maximum number of characters to return.
 * @returns Uppercase initials or an empty string when name is falsy.
 */
export const getInitials = (name: string | null | undefined, maxLength?: number): string => {
  if (!name) {
    return '';
  }

  const sanitized = name
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();

  if (!sanitized) {
    return '';
  }

  if (maxLength && maxLength > 0) {
    return sanitized.slice(0, maxLength);
  }

  return sanitized;
};

export default getInitials;
