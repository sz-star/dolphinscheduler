/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteCompression from 'vite-plugin-compression'
import path, { join } from 'path'
import { writeFileSync } from 'fs'

export default defineConfig({
  base:
    (process.env.NODE_ENV === 'production' ? '/dolphinscheduler/ui' : '') +
    '/vite/',
  plugins: [
    vue(),
    vueJsx(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    }),
    (function () {
      let basePath = ''
      return {
        name: 'vite:micro-app',
        apply: 'build',
        configResolved(config) {
          basePath = `${config.base}${config.build.assetsDir}/`
        },
        // renderChunk(code, chunk) {
        //   if (chunk.fileName.endsWith('.js')) {
        //     code = code.replace(/(from|import\()(\s*['"])(\.\.?\/)/g, (all, $1, $2, $3) => {
        //       return all.replace($3, new URL($3, basePath))
        //     })
        //   }
        //   return code
        // },
        // writeBundle 钩子可以拿到完整处理后的文件，但已经无法修改
        writeBundle(options, bundle) {
          for (const chunkName in bundle) {
            if (Object.prototype.hasOwnProperty.call(bundle, chunkName)) {
              const chunk = bundle[chunkName]
              if (chunk.fileName && chunk.fileName.endsWith('.js')) {
                chunk.code = chunk.code.replace(
                  /(from|import\()(\s*['"])(\.\.?\/)/g,
                  (all, $1, $2, $3) => {
                    return all.replace($3, new URL($3, basePath))
                  }
                )
                const fullPath = join(options.dir, chunk.fileName)
                writeFileSync(fullPath, chunk.code)
              }
            }
          }
        }
        // generateBundle 执行时import() 还是 q(()=>import("./page2.cdecf1fd.js"),"__VITE_PRELOAD__")
        // generateBundle (options, bundle) {
        //   for (const chunkName in bundle) {
        //     if (Object.prototype.hasOwnProperty.call(bundle, chunkName)) {
        //       const chunk = bundle[chunkName]
        //       if (chunk.fileName && chunk.fileName.endsWith('.js')) {
        //         chunk.code = chunk.code.replace(/(from|import)(\s*['"])(\.\.?\/)/g, (all, $1, $2, $3) => {
        //           return all.replace($3, new URL($3, basePath))
        //         })

        //         if (chunk.fileName.includes('index')) {
        //           console.log(22222222, chunk.code)
        //         }
        //       }
        //     }
        //   }
        // },
      }
    })() as any
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // resolve vue-i18n warning: You are running the esm-bundler build of vue-i18n.
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
    }
  },
  server: {
    proxy: {
      '/dolphinscheduler': {
        target: loadEnv('development', './').VITE_APP_DEV_WEB_URL,
        changeOrigin: true
      }
    }
  }
})
