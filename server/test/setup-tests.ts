// Global test setup for e2e tests
jest.setTimeout(10000); // 10 second timeout - reduced from 30s for better efficiency

// Set up environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests';
process.env.JWT_EXPIRES_IN = '1h';

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled promise rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.warn('Uncaught exception:', error);
});

// Increase max listeners to prevent warnings
process.setMaxListeners(20);
