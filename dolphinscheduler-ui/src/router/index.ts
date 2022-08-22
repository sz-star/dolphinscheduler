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

import {
  createRouter,
  createWebHistory,
  NavigationGuardNext,
  RouteLocationNormalized
} from 'vue-router'
import routes from './routes'
import { useUserStore } from '@/store/user/user'
import type { UserInfoRes } from '@/service/modules/users/types'

// NProgress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// const router = createRouter({
//   history: createWebHistory(
//     import.meta.env.MODE === 'production' ? '/dolphinscheduler/ui/' : '/'
//   ),
//   routes
// })

const basename =
  import.meta.env.MODE === 'production' ? '/dolphinscheduler/ui/' : ''
let router: any
declare global {
  interface Window {
    // 是否存在无界
    __POWERED_BY_WUJIE__?: boolean
    // 子应用mount函数
    __WUJIE_MOUNT: () => void
    // 子应用unmount函数
    __WUJIE_UNMOUNT: () => void
    // 子应用无界实例
    __WUJIE: { mount: () => void }
  }
}

if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_MOUNT = () => {
    router = createRouter({ history: createWebHistory(basename), routes })
  }
  // module脚本异步加载，应用主动调用生命周期
  window.__WUJIE.mount()
} else {
  router = createRouter({ history: createWebHistory(basename), routes })
}

interface metaData {
  title?: string
  activeMenu?: string
  showSide?: boolean
  auth?: Array<string>
}

/**
 * Routing to intercept
 */
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    NProgress.start()
    const userStore = useUserStore()
    const metaData: metaData = to.meta
    if (
      metaData.auth?.includes('ADMIN_USER') &&
      (userStore.getUserInfo as UserInfoRes).userType !== 'ADMIN_USER' &&
      metaData.activeMenu === 'security'
    ) {
      to.fullPath = '/security/token-manage'
      next({ name: 'token-manage' })
    } else {
      next()
    }

    NProgress.done()
  }
)

router.afterEach(() => {
  NProgress.done()
})

export default router
