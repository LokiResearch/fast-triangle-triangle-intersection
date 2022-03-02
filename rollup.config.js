import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default [
  {
    input: './src/index.ts',
    external: ['three'],

    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true

      }
    ],
    plugins: [
      typescript()
    ]
  }
];