const base = require('./shared/config/jest.base');
module.exports = {
    ...base,
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    coverageThreshold: {
        global: {
            statements: 42,
            branches: 18,
            functions: 27,
            lines: 42,
        },
    },
};