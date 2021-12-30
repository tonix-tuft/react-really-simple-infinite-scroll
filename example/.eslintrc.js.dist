module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    es6: true,
  },
  extends: ["eslint:recommended", "standard", "standard-react"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["react", "react-hooks"],
  rules: {
    "jsx-quotes": "off",
    "no-void": 0,
    quotes: "off",
    semi: "off",
    "space-before-function-paren": "off",
    "no-unused-vars": ["error", { ignoreRestSiblings: true }],
    "no-console": "error",
    "standard/computed-property-even-spacing": "off",
    "react/prop-types": 0,
    "react/jsx-uses-react": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "comma-dangle": "off",
    indent: [
      "error",
      2,
      {
        ignoredNodes: ["TemplateLiteral"],
      },
    ],
    "template-curly-spacing": ["off"],
  },
  overrides: [],
};
