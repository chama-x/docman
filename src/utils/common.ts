/**
 * Debounce function to limit how often a function can be called
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generate a random string ID
 */
export const generateId = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sleep for a specified duration
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Safely parse JSON with error handling
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    return fallback;
  }
};

/**
 * Check if an object is empty
 */
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Get nested object property safely with path
 */
export const getNestedValue = <T>(
  obj: Record<string, any>,
  path: string,
  defaultValue: T
): T => {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === undefined || current === null) {
      return defaultValue;
    }
    current = current[key];
  }

  return current !== undefined && current !== null ? (current as T) : defaultValue;
}; 