import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import htmlTemplate from 'rollup-plugin-generate-html-template';

const lib_cfg = {
  input: 'src/index.ts',
  external: ['three'],
  output: [
    {
      format: 'cjs',
      file: 'build/index.cjs',
      sourcemap: true,
    },
    {
      format: 'esm',
      file: 'build/index.js',
      sourcemap: true,
    }
  ],
  plugins: [typescript({tsconfig: './tsconfig.json'})]
};

const demo_cfg =  {
  input: 'demo/intersect.ts',
  output: {
    file: 'build/demo/intersect.js',
  },
  plugins: [
    typescript({tsconfig: './tsconfig-demo.json'}),
    nodeResolve(),
    htmlTemplate({
      template: 'demo/index.html',
      target: 'index.html',
    }),
  ]
};


let exported;
if (process.env.demo) {
  exported = demo_cfg;
} else {
  exported = lib_cfg;
}

export default exported;
