import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import RecordingManagement from '../components/RecordingManagement.vue'
import ResponsiveTest from '../components/ResponsiveTest.vue'
import APITester from '../components/APITester.vue'

// 检查用户是否已登录
const isUserLoggedIn = () => {
  try {
    // 首先检查 sessionStorage
    let userInfo = sessionStorage.getItem('feishu_user_info')
    
    // 如果 sessionStorage 中没有，检查 localStorage
    if (!userInfo) {
      userInfo = localStorage.getItem('feishu_user_info')
    }
    
    if (!userInfo) return false
    
    const parsedUserInfo = JSON.parse(userInfo)
    return parsedUserInfo && parsedUserInfo.name && parsedUserInfo.name !== '未知用户'
  } catch (error) {
    console.error('检查用户登录状态失败:', error)
    return false
  }
}

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/recording',
    name: 'RecordingManagement',
    component: RecordingManagement,
    meta: {
      title: '录音管理',
      requiresAuth: true // 需要登录
    }
  },
  {
    path: '/responsive-test',
    name: 'ResponsiveTest',
    component: ResponsiveTest,
    meta: {
      title: '响应式测试'
    }
  },
  {
    path: '/api-tester',
    name: 'APITester',
    component: APITester,
    meta: {
      title: 'API测试'
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../components/NotFound.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题和检查登录状态
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !isUserLoggedIn()) {
    console.log('用户未登录，重定向到首页')
    console.log('保存重定向路径:', to.fullPath)
    // 保存用户想要访问的路径
    sessionStorage.setItem('redirectAfterLogin', to.fullPath)
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router 