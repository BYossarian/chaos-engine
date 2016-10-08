
'use strict';

var gulp = require('gulp');

var eslint = require('gulp-eslint');

var ES_LINT_CONFIG = {
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 5
    },
    env: {
        browser: true,
        node: true
    },
    rules: {
        'no-console': 'off',
        semi: ['warn', 'always'],
        'new-cap': 'off',
        strict: ['error', 'global'],
        'no-underscore-dangle': 'off',
        'no-use-before-define': 'error',
        'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
        'eol-last': 'off',
        quotes: ['error', 'single']
    }
};
var JS_FILES = ['src/**/*.js', 'demo/**/*.js'];


gulp.task('lint', function() {

    return gulp.src(JS_FILES)
            .pipe(eslint(ES_LINT_CONFIG))
            .pipe(eslint.format('node_modules/eslint-formatter-pretty'))
            .pipe(eslint.failOnError());

});
