const base = require('./shared/config/jest.base');
module.exports = {
    ...base,
    coverageThreshold: {
        global: {
            statements: 42,
            branches: 18,
            functions: 27,
            lines: 42,
        },
    },
};