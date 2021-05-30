module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
    es6: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "prettier",
    "prettier/@typescript-eslint"
  ]
};
