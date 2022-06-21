import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

export default [
   // electron
   {
      input: 'shell-src/main.ts',
      output: [
         {
            file: 'build/main.js',
            format: 'cjs',
            sourcemap: false
         },
      ],
      plugins: [
         typescript({
            tsconfig: './shell.tsconfig.json'
         }),
         copy({
            targets: [
               { src: './assets/index.html', dest: './build/' }
            ]
         })
      ]
   },
   // react
   {
      input: 'window-src/index.tsx',
      output: [
         {
            file: 'build/index.js',
            format: 'cjs',
            sourcemap: true,
            globals: [
               'react',
            ],
         },
      ],
      plugins: [
         typescript({
            tsconfig: './window.tsconfig.json'
         }),
         commonjs({
            include: './node_modules/**',
         }),
         nodeResolve(),
         replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
            preventAssignment: true,
         }),
      ]
   }
]
