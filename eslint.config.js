// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['app', 'ais'], style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: ['app', 'ais'], style: 'kebab-case' }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      // the ais-* form controls of the library hold the input the label is associated with
      '@angular-eslint/template/label-has-associated-control': ['error', {
        controlComponents: [
          'ais-numeral-input', 'ais-currency-input', 'ais-datectr-input', 'ais-icontype-input',
          'ais-limitslider', 'ais-control-selector', 'ais-aicontrol-list', 'ais-lingua-selector',
        ],
      }],
    },
  },
  {
    // the library components keep plain mutable fields and rely on default (Eager) change detection
    files: ['projects/aisuite-eu-ngtools/**/*.ts'],
    rules: { '@angular-eslint/prefer-on-push-component-change-detection': 'off' },
  },
]);
