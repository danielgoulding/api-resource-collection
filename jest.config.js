module.exports = {
  roots: ['src'],
  automock: false,
  setupFiles: ['<rootDir>/src/setupJest.ts'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest'
  }
};
