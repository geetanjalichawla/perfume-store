module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
      moduleNameMapper: {
    "^@prisma/client$": "<rootDir>/src/config/__mocks__/db.config.ts",
  },
  };
  