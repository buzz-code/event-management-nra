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
        "**/*.(t|j)sx?",
        "!**/node_modules/**",
        "!**/dist/**",
        "!**/coverage/**",
        "!helpers/**",
        "!.eslintrc.js",
        "!jest.config.js",
        "!**/migrations/**",
        "!test/**",
        "!**/config/**",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["json", "lcov", "text", "clover"],
}
