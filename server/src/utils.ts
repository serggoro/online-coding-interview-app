/**
 * Utility functions for the coding interview server
 */

/**
 * Generates a unique session ID using random string generation
 * @returns A random 9-character string
 */
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Validates if a session ID has the correct format
 * @param sessionId - The session ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidSessionId(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  // Session IDs should be 9 characters, alphanumeric
  return /^[a-z0-9]{9}$/.test(sessionId);
}

/**
 * Validates if a language is supported
 * @param language - The language to validate
 * @returns true if supported, false otherwise
 */
export function isSupportedLanguage(language: string): boolean {
  const supportedLanguages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go'];
  return supportedLanguages.includes(language.toLowerCase());
}

/**
 * Gets the default code template for a given language
 * @param language - The programming language
 * @returns Default code template for the language
 */
export function getDefaultCodeTemplate(language: string): string {
  const templates: Record<string, string> = {
    javascript: '// Write your JavaScript code here\n',
    typescript: '// Write your TypeScript code here\n',
    python: '# Write your Python code here\n',
    java: 'public class Solution {\n  public static void main(String[] args) {\n    // Write your code here\n  }\n}\n',
    cpp: '#include <iostream>\n\nint main() {\n  // Write your code here\n  return 0;\n}\n',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n  // Write your code here\n}\n'
  };

  return templates[language.toLowerCase()] || '// Write your code here\n';
}

/**
 * Sanitizes code by removing potentially dangerous patterns
 * @param code - The code to sanitize
 * @returns Sanitized code
 */
export function sanitizeCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return '';
  }
  // Remove null bytes and control characters
  return code.replace(/\0|[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Calculates the size of code in bytes
 * @param code - The code to measure
 * @returns Size in bytes
 */
export function getCodeSize(code: string): number {
  if (!code) return 0;
  return Buffer.byteLength(code, 'utf8');
}

/**
 * Checks if code size exceeds the maximum limit
 * @param code - The code to check
 * @param maxSizeBytes - Maximum size in bytes (default: 1MB)
 * @returns true if code exceeds limit, false otherwise
 */
export function isCodeTooLarge(code: string, maxSizeBytes: number = 1024 * 1024): boolean {
  return getCodeSize(code) > maxSizeBytes;
}

/**
 * Generates a shareable link for a session
 * @param sessionId - The session ID
 * @param baseUrl - The base URL (default: localhost)
 * @returns A formatted share link
 */
export function generateShareLink(sessionId: string, baseUrl: string = 'http://localhost:5173'): string {
  if (!isValidSessionId(sessionId)) {
    throw new Error('Invalid session ID');
  }
  return `${baseUrl}/session/${sessionId}`;
}

/**
 * Counts the number of lines in code
 * @param code - The code to count
 * @returns Number of lines
 */
export function countLines(code: string): number {
  if (!code) return 0;
  return code.split('\n').length;
}
