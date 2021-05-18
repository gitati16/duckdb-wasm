const puppeteer = require('puppeteer');

process.env.CHROME_BIN = puppeteer.executablePath();

const JS_TIMEOUT = 900000;

module.exports = function (config) {
    return {
        basePath: '../..',
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-sourcemap-loader',
            'karma-spec-reporter',
            'karma-coverage',
            'karma-jasmine-html-reporter',
        ],
        frameworks: ['jasmine'],
        files: [
            { pattern: 'packages/duckdb/dist/tests-browser.js' },
            { pattern: 'packages/duckdb/dist/*.wasm', included: false, watched: false, served: true },
            { pattern: 'packages/duckdb/dist/*.js', included: false, watched: false, served: true },
            { pattern: 'data/**/*.parquet', included: false, watched: false, served: true },
            { pattern: 'data/**/*.zip', included: false, watched: false, served: true },
        ],
        preprocessors: {
            '**/tests-*.js': ['sourcemap', 'coverage'],
        },
        proxies: {
            '/static/': '/base/packages/duckdb/dist/',
            '/data/': '/base/data/',
        },
        exclude: [],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: true,
        browsers: ['ChromeHeadlessNoSandbox', 'FirefoxHeadless'],
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox'],
            },
        },
        specReporter: {
            maxLogLines: 5,
            suppressErrorSummary: true,
            suppressFailed: false,
            suppressPassed: false,
            suppressSkipped: true,
            showSpecTiming: true,
            failFast: true,
            prefixes: {
                success: '    OK: ',
                failure: 'FAILED: ',
                skipped: 'SKIPPED: ',
            },
        },
        coverageReporter: {
            type: 'json',
            dir: './packages/duckdb/coverage/',
            subdir: function (browser) {
                return browser.toLowerCase().split(/[ /-]/)[0];
            },
        },
        client: {
            jasmine: {
                failFast: true,
                timeoutInterval: JS_TIMEOUT,
            },
        },
        captureTimeout: JS_TIMEOUT,
        browserDisconnectTimeout: JS_TIMEOUT,
        browserDisconnectTolerance: 1,
        browserNoActivityTimeout: JS_TIMEOUT,
        processKillTimeout: JS_TIMEOUT,
        concurrency: 1,
    };
};
