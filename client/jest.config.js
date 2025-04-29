module.exports = {
    moduleNameMapper: {
        "src/(.*)": "<rootDir>/src/$1",
        "@shared/(.*)": "<rootDir>/shared/$1"
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./src/setupTests.js'],
};