module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2018
  },
  env: {
    node: true,
    browser: true,
    es6: true
  },
  plugins: ['prettier'],
  globals: {
    "$": false,
    "_": false,
    "Cookies": false,
    "md5": false,
    "Ext": false,
    "localforage": false,
    "jsPlumb": false,
    "optionsStore": false,
    "Dashboard": false,
    "DashboardEngine": false,
    "KnowledgeWorks": false,
    "ChartDesigner": false,
    "BusyIndicator": false,
    "recharts": false,
    "com": true,
    "QuiltOS": true,
    "QuiltApp": true,
    "SLSession": true,
    "funJSON": true,
    "Utilities": true,
  },
  rules: {
    'curly':"error",
    'no-console':"off",
    'quotes': ["error", "single", { "avoidEscape": true }],
    'quote-props': ["error", "as-needed", { "keywords": true, "unnecessary": false }],
    "lines-between-class-members": ["error", "always"],
    "padding-line-between-statements": [
        "error",
        { "blankLine": "always", "prev": ["block", "block-like"], "next": "*" },
        { "blankLine": "always", "prev": "*", "next": "function" },
        { "blankLine": "always", "prev": "function", "next": "*" },
    ],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
        arrowParens: 'always',
        printWidth: 100,
      },
    ],
  },
};
