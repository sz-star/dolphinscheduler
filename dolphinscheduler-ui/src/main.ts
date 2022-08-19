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

import { createApp } from 'vue'
import App from './App'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import i18n from '@/locales'
import * as echarts from 'echarts'
import 'echarts/theme/macarons'
import 'echarts/theme/dark-bold'
import './assets/styles/default.scss'
import { Router } from 'vue-router'

declare global {
  interface Window {
    eventCenterForAppNameVite: any
    __MICRO_APP_NAME__: string
    __MICRO_APP_ENVIRONMENT__: string
    __MICRO_APP_BASE_APPLICATION__: string
  }
}

// 与基座进行数据交互
function handleMicroData(router: Router) {
  // eventCenterForAppNameVite 是基座添加到window的数据通信对象
  if (window.eventCenterForAppNameVite) {
    // 主动获取基座下发的数据
    console.log(
      'child-vite getData:',
      window.eventCenterForAppNameVite.getData()
    )

    // 监听基座下发的数据变化
    window.eventCenterForAppNameVite.addDataListener(
      (data: Record<string, unknown>) => {
        console.log('child-vite addDataListener:', data)

        if (data.path && typeof data.path === 'string') {
          data.path = data.path.replace(/^#/, '')
          // 当基座下发path时进行跳转
          if (data.path && data.path !== router.currentRoute.value.path) {
            router.push(data.path as string)
          }
        }
      }
    )

    // 向基座发送数据
    setTimeout(() => {
      window.eventCenterForAppNameVite.dispatch({ myname: 'child-vite' })
    }, 3000)
  }
}

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.config.globalProperties.echarts = echarts

app.use(router)
app.use(pinia)
app.use(i18n)
app.mount('#vite-app')

handleMicroData(router)

// 监听卸载操作
window.addEventListener('unmount', function () {
  app.unmount()
  // 卸载所有数据监听函数
  window.eventCenterForAppNameVite?.clearDataListener()
  console.log('微应用child-vite卸载了')
})
