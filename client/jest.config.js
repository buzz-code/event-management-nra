module.exports = {
    moduleNameMapper: {
        "src/(.*)": "<rootDir>/src/$1",
        "@shared/(.*)": "<rootDir>/shared/$1"
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./src/setupTests.js'],
    coverageThreshold: {
        global: {
            statements: 42,
            branches: 18,
            functions: 27,
            lines: 42
        }
    }
};