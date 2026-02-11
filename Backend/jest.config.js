module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'controllers/**/*.js',
        'services/**/*.js',
        'models/**/*.js',
        'routes/**/*.js',
        'middlewares/**/*.js',
        '!node_modules/**',
        '!coverage/**',
        '!test/**'
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: ['**/test/**/*.test.js'],
    verbose: true,
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    }
};
