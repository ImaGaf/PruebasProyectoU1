module.exports = {
    testEnvironment: 'node',
    maxWorkers: 1,
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
    testTimeout: 30000,
    verbose: true,
};
