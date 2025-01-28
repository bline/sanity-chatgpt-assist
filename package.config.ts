import {defineConfig} from '@sanity/pkg-utils'
import alias from '@rollup/plugin-alias'
import resolve from '@rollup/plugin-node-resolve'
import path from 'path'

export default defineConfig({
  dist: 'dist',
  tsconfig: 'tsconfig.dist.json',
  rollup: {

    plugins: [
      alias({
        entries: [
          {find: /^@\/(.*)/, replacement: path.resolve(__dirname, 'src/$1')}
        ],
      }),
      resolve({
        extensions: ['.ts', '.tsx'],
      })
    ],
  },

  // Remove this block to enable strict export validation
  extract: {
    rules: {
      'ae-forgotten-export': 'off',
      'ae-incompatible-release-tags': 'off',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'off',
    },
  },
})
