import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'jest-playwright-preset',
  testEnvironment: 'node',
  testMatch: ["**/__tests__/**/*.+(ts|js)", "**/?(*.)+(spec|test).+(ts|js)"],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    "^.+\\.(ts)$": "ts-jest"},
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};

export default config;
