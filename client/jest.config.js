module.exports = {
    moduleNameMapper: {
        "src/(.*)": "<rootDir>/src/$1",
        "@shared/(.*)": "<rootDir>/shared/$1"
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./src/setupTests.js'],
    collectCoverageFrom: [
        "src/**/*.{ts,tsx,js,jsx}",
        "shared/**/*.{ts,tsx,js,jsx}",
        "!**/node_modules/**",
        "!**/dist/**",
        "!**/coverage/**",
        "!**/__tests__/**",
        "!**/config/**",
        "!**/*.spec.{ts,tsx,js,jsx}",
        "!**/*.test.{ts,tsx,js,jsx}",
        "!src/index.js",
        "!src/setupTests.js",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["json", "lcov", "text", "clover"],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80
        }
    }
};