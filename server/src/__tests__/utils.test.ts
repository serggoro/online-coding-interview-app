import {
  generateSessionId,
  isValidSessionId,
  isSupportedLanguage,
  getDefaultCodeTemplate,
  sanitizeCode,
  getCodeSize,
  isCodeTooLarge,
  generateShareLink,
  countLines
} from '../utils';

describe('Session ID Generation and Validation', () => {
  describe('generateSessionId', () => {
    it('should generate a 9-character string', () => {
      const sessionId = generateSessionId();
      expect(sessionId).toHaveLength(9);
    });

    it('should generate alphanumeric strings', () => {
      for (let i = 0; i < 10; i++) {
        const sessionId = generateSessionId();
        expect(/^[a-z0-9]{9}$/.test(sessionId)).toBe(true);
      }
    });

    it('should generate unique IDs (with high probability)', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSessionId());
      }
      // Should have at least 99 unique IDs out of 100
      expect(ids.size).toBeGreaterThanOrEqual(99);
    });
  });

  describe('isValidSessionId', () => {
    it('should validate correct session IDs', () => {
      expect(isValidSessionId('abcdef123')).toBe(true);
      expect(isValidSessionId('012345678')).toBe(true);
    });

    it('should reject invalid session IDs', () => {
      expect(isValidSessionId('')).toBe(false);
      expect(isValidSessionId('abc')).toBe(false); // Too short
      expect(isValidSessionId('abcdefghij')).toBe(false); // Too long
      expect(isValidSessionId('ABC123DEF')).toBe(false); // Uppercase
      expect(isValidSessionId('abcdef12_')).toBe(false); // Invalid character
    });

    it('should handle non-string inputs', () => {
      expect(isValidSessionId(null as any)).toBe(false);
      expect(isValidSessionId(undefined as any)).toBe(false);
      expect(isValidSessionId(123 as any)).toBe(false);
    });
  });
});

describe('Language Support', () => {
  describe('isSupportedLanguage', () => {
    it('should support standard languages', () => {
      expect(isSupportedLanguage('javascript')).toBe(true);
      expect(isSupportedLanguage('python')).toBe(true);
      expect(isSupportedLanguage('java')).toBe(true);
      expect(isSupportedLanguage('cpp')).toBe(true);
      expect(isSupportedLanguage('go')).toBe(true);
      expect(isSupportedLanguage('typescript')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isSupportedLanguage('JAVASCRIPT')).toBe(true);
      expect(isSupportedLanguage('Python')).toBe(true);
      expect(isSupportedLanguage('JAVA')).toBe(true);
    });

    it('should reject unsupported languages', () => {
      expect(isSupportedLanguage('ruby')).toBe(false);
      expect(isSupportedLanguage('php')).toBe(false);
      expect(isSupportedLanguage('rust')).toBe(false);
      expect(isSupportedLanguage('')).toBe(false);
    });
  });

  describe('getDefaultCodeTemplate', () => {
    it('should return correct template for javascript', () => {
      const template = getDefaultCodeTemplate('javascript');
      expect(template).toContain('// Write your JavaScript code here');
    });

    it('should return correct template for python', () => {
      const template = getDefaultCodeTemplate('python');
      expect(template).toContain('# Write your Python code here');
    });

    it('should return correct template for java', () => {
      const template = getDefaultCodeTemplate('java');
      expect(template).toContain('public class Solution');
    });

    it('should be case-insensitive', () => {
      const template1 = getDefaultCodeTemplate('JAVASCRIPT');
      const template2 = getDefaultCodeTemplate('javascript');
      expect(template1).toBe(template2);
    });

    it('should return default template for unknown language', () => {
      const template = getDefaultCodeTemplate('unknown');
      expect(template).toBe('// Write your code here\n');
    });
  });
});

describe('Code Sanitization', () => {
  describe('sanitizeCode', () => {
    it('should return code as-is for clean input', () => {
      const code = 'console.log("hello");';
      expect(sanitizeCode(code)).toBe(code);
    });

    it('should remove null bytes', () => {
      const code = 'console.log("hello")\0world';
      expect(sanitizeCode(code)).toBe('console.log("hello")world');
    });

    it('should remove control characters', () => {
      const code = 'hello\x00world\x08test';
      expect(sanitizeCode(code)).not.toContain('\x00');
      expect(sanitizeCode(code)).not.toContain('\x08');
    });

    it('should handle empty input', () => {
      expect(sanitizeCode('')).toBe('');
      expect(sanitizeCode(null as any)).toBe('');
    });

    it('should handle non-string input', () => {
      expect(sanitizeCode(undefined as any)).toBe('');
    });

    it('should preserve newlines and tabs', () => {
      const code = 'function test() {\n\treturn true;\n}';
      expect(sanitizeCode(code)).toBe(code);
    });
  });
});

describe('Code Size and Limits', () => {
  describe('getCodeSize', () => {
    it('should calculate size in bytes', () => {
      const code = 'hello'; // 5 bytes
      expect(getCodeSize(code)).toBe(5);
    });

    it('should handle multibyte characters', () => {
      const code = '你好'; // 6 bytes in UTF-8
      expect(getCodeSize(code)).toBe(6);
    });

    it('should return 0 for empty input', () => {
      expect(getCodeSize('')).toBe(0);
      expect(getCodeSize(null as any)).toBe(0);
    });

    it('should handle code with newlines and special characters', () => {
      const code = 'console.log("hello world");\n';
      expect(getCodeSize(code)).toBe(Buffer.byteLength(code, 'utf8'));
    });
  });

  describe('isCodeTooLarge', () => {
    it('should return false for small code', () => {
      const code = 'console.log("hello");';
      expect(isCodeTooLarge(code, 1024)).toBe(false);
    });

    it('should return true for code exceeding limit', () => {
      const code = 'x'.repeat(2000);
      expect(isCodeTooLarge(code, 1000)).toBe(true);
    });

    it('should use default limit of 1MB', () => {
      const code = 'small code';
      expect(isCodeTooLarge(code)).toBe(false);
    });

    it('should handle empty code', () => {
      expect(isCodeTooLarge('', 1024)).toBe(false);
    });

    it('should handle exact size match', () => {
      const code = 'x'.repeat(100);
      expect(isCodeTooLarge(code, 100)).toBe(false);
      expect(isCodeTooLarge(code, 99)).toBe(true);
    });
  });
});

describe('Share Link Generation', () => {
  describe('generateShareLink', () => {
    it('should generate valid share link for valid session ID', () => {
      const link = generateShareLink('abc123def');
      expect(link).toBe('http://localhost:5173/session/abc123def');
    });

    it('should use custom base URL', () => {
      const link = generateShareLink('abc123def', 'https://example.com');
      expect(link).toBe('https://example.com/session/abc123def');
    });

    it('should throw for invalid session ID', () => {
      expect(() => generateShareLink('invalid')).toThrow('Invalid session ID');
      expect(() => generateShareLink('ABC123DEF')).toThrow('Invalid session ID');
    });

    it('should handle different base URL formats', () => {
      const link1 = generateShareLink('abc123def', 'http://localhost:3000');
      expect(link1).toBe('http://localhost:3000/session/abc123def');

      const link2 = generateShareLink('abc123def', 'https://app.example.com');
      expect(link2).toBe('https://app.example.com/session/abc123def');
    });
  });
});

describe('Code Line Counting', () => {
  describe('countLines', () => {
    it('should count single line', () => {
      expect(countLines('console.log("hello");')).toBe(1);
    });

    it('should count multiple lines', () => {
      const code = 'function test() {\n  return true;\n}';
      expect(countLines(code)).toBe(3);
    });

    it('should count lines with trailing newline', () => {
      const code = 'line1\nline2\n';
      expect(countLines(code)).toBe(3); // line1, line2, empty line at end
    });

    it('should return 0 for empty input', () => {
      expect(countLines('')).toBe(0);
      expect(countLines(null as any)).toBe(0);
    });

    it('should handle code with various line endings', () => {
      const code = 'line1\nline2\nline3';
      expect(countLines(code)).toBe(3);
    });

    it('should handle code with empty lines', () => {
      const code = 'line1\n\n\nline2';
      expect(countLines(code)).toBe(4);
    });
  });
});
