/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^d3-scale$': '<rootDir>/test/mocks/d3-scale.ts',
    '^d3-interpolate$': '<rootDir>/test/mocks/d3-interpolate.ts',
  },
};
