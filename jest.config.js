module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1"
  },
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tests/tsconfig.json"
    }
  }
};
