describe('constantsProvider', () => {
  const originalWindow = { ...window };
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset window.location before each test
    delete window.location;
    window.location = {
      protocol: 'http:',
      hostname: 'example.com',
      port: '',
    };

    // Reset process.env
    process.env = { ...originalEnv };
    delete process.env.REACT_APP_API_URL;

    // Clear module cache to ensure fresh import
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original window and process.env
    window = { ...originalWindow };
    process.env = originalEnv;
  });

  describe('getDefaultApiUrl', () => {
    it('handles localhost with port', () => {
      window.location = {
        protocol: 'http:',
        hostname: 'localhost',
        port: '3000',
      };

      const { apiUrl } = require('../constantsProvider');
      expect(apiUrl).toBe('http://localhost:3001');
    });

    it('handles localhost without port', () => {
      window.location = {
        protocol: 'http:',
        hostname: 'localhost',
        port: '',
      };

      const { apiUrl } = require('../constantsProvider');
      expect(apiUrl).toBe('http://localhost:8080');
    });

    it('handles IP addresses with port', () => {
      window.location = {
        protocol: 'http:',
        hostname: '192.168.1.100',
        port: '3000',
      };

      const { apiUrl } = require('../constantsProvider');
      expect(apiUrl).toBe('http://192.168.1.100:3001');
    });

    it('handles IP addresses without port', () => {
      window.location = {
        protocol: 'http:',
        hostname: '192.168.1.100',
        port: '',
      };

      const { apiUrl } = require('../constantsProvider');
      expect(apiUrl).toBe('http://192.168.1.100:8080');
    });

    it('handles domain names', () => {
      window.location = {
        protocol: 'https:',
        hostname: 'example.com',
        port: '',
      };

      const { apiUrl } = require('../constantsProvider');
      expect(apiUrl).toBe('https://api.example.com');
    });

    it('handles secure protocol', () => {
      window.location = {
        protocol: 'https:',
        hostname: 'localhost',
        port: '3000',
      };

      const { apiUrl } = require('../constantsProvider');
      expect(apiUrl).toBe('https://localhost:3001');
    });
  });

  describe('environment variable', () => {
    it('uses REACT_APP_API_URL when provided', () => {
      process.env.REACT_APP_API_URL = 'https://api.test.com';
      
      const { apiUrl } = require('../constantsProvider');
      expect(apiUrl).toBe('https://api.test.com');
    });

    it('falls back to default URL when environment variable is not set', () => {
      window.location = {
        protocol: 'https:',
        hostname: 'example.com',
        port: '',
      };

      const { apiUrl } = require('../constantsProvider');
      expect(apiUrl).toBe('https://api.example.com');
    });
  });
});