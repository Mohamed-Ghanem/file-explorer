module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    '^utils/svgs$': '<rootDir>/src/utils/svgs',
    '^utils/helpers$': '<rootDir>/src/utils/helpers',
    "\\.css$": "jest-transform-stub",
  },
  transformIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
