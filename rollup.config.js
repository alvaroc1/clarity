import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

export default [
   // electron
   {
      input: 'main-src/main.ts',
      output: [
         {
            file: 'build/main.js',
            format: 'cjs',
            sourcemap: false
         },
      ],
      plugins: [
         typescript({
            tsconfig: './main.tsconfig.json'
         }),
         copy({
            targets: [
               { src: './assets/*', dest: './build/' },
            ]
         }),
      ]
   },
   // react
   {
      input: 'renderer-src/index.tsx',
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
            tsconfig: './renderer.tsconfig.json'
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
   },
   {
      input: 'renderer-src/settings.tsx',
      output: [
         {
            file: 'build/settings.js',
            format: 'cjs',
            sourcemap: true,
            globals: [
               'react',
            ],
         },
      ],
      plugins: [
         typescript({
            tsconfig: './renderer.tsconfig.json'
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
