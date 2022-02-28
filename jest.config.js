export default {
  "preset": 'ts-jest/presets/js-with-ts-esm',
  "testEnvironment": 'node',
  'verbose': true,
  "roots": [
    "src",
  ],
  "globals": {
    "ts-jest": {
      "useESM": true
    }
  },
}