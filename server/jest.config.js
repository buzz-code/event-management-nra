const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    modulePaths: [
        '<rootDir>'
    ],
    maxWorkers: 1,
    testRegex: ".*\\.(spec|test)\\.(ts|tsx)$",
    transform: {
        "^.+\\.(t|j)sx?$": "ts-jest"
    },
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "shared/**/*.{ts,tsx}",
        "!src/**/*.d.ts",
        "!shared/**/*.d.ts",
        "!**/node_modules/**",
        "!**/dist/**",
        "!**/coverage/**",
        "!helpers/**",
        "!.eslintrc.js",
        "!jest.config.js",
        "!**/migrations/**",
        "!test/**",
        "!**/__tests__/**",
        "!**/main.ts"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["json", "lcov", "text", "clover"],
    coverageThreshold: {
        global: {
            statements: 77,
            branches: 58,
            functions: 67,
            lines: 77
        }
    }
}
