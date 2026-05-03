const { compilerOptions } = require('./tsconfig');
const makeJestBase = require('./shared/config/jest.base');
module.exports = {
    ...makeJestBase(compilerOptions),
    coverageThreshold: {
        global: {
            statements: 77,
            branches: 58,
            functions: 67,
            lines: 77,
        },
    },
};
