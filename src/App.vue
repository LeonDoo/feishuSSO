<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { feishuAuth } from './utils/feishuAuth.js'
import { APP_TITLE, ENV_NAME } from './config/index.js'

// 获取路由实例
const router = useRouter()
const route = useRoute()

// 用户信息状态
const userInfo = ref({
  name: '加载中...',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Loading'
})

// 加载状态
const isLoading = ref(true)
const loadError = ref(null)

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    isLoading.value = true
    loadError.value = null
    
    // 如果当前不在首页，清除重定向路径，避免登录时的重定向URI问题
    if (route.name !== 'Home') {
      console.log('当前不在首页，清除重定向路径')
      sessionStorage.removeItem('redirectAfterLogin')
    }
    
    console.log('开始获取用户信息...')
    const userData = await feishuAuth.checkLoginAndGetUser()
    
    userInfo.value = {
      name: userData.name,
      avatar: userData.avatar,
      welcomeText: userData.welcomeText,
      rawData: userData.rawData
    }
    
    console.log('用户信息获取成功:', userData)
  } catch (error) {
    console.error('获取用户信息失败:', error)
    
    // 根据错误类型设置不同的错误信息
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      loadError.value = `后端服务器未启动 (${feishuAuth.apiBaseUrl})`
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      loadError.value = '网络连接失败，请检查后端服务'
    } else if (error.message.includes('获取到的用户信息无效')) {
      loadError.value = '用户信息获取失败，请重新登录'
    } else {
      loadError.value = error.message || '获取用户信息失败'
    }
    
    // 不设置默认用户信息，保持用户信息为空
    // 这样用户可以通过重新获取来尝试登录
  } finally {
    isLoading.value = false
  }
}

// 登出功能
const logout = () => {
  feishuAuth.clearUserInfo()
  userInfo.value = {
    name: '',
    avatar: '',
    welcomeText: '',
    rawData: null
  }
  loadError.value = null
  // 清除重定向路径
  sessionStorage.removeItem('redirectAfterLogin')
  // 跳转到首页，确保下次登录时的重定向URI是有效的
  router.push({ name: 'Home' })
  console.log('用户已登出')
}

// 清除Session功能（用于调试）
const clearSession = () => {
  feishuAuth.clearUserInfo()
  userInfo.value = {
    name: '',
    avatar: '',
    welcomeText: '',
    rawData: null
  }
  loadError.value = null
  isLoading.value = false
  // 清除重定向路径
  sessionStorage.removeItem('redirectAfterLogin')
  // 跳转到首页，确保下次登录时的重定向URI是有效的
  router.push({ name: 'Home' })
  console.log('Session已清除')
}

// 页面切换功能
const switchPage = (page) => {
  router.push({ name: page })
  console.log('切换到页面:', page)
}

// 组件挂载时获取用户信息
onMounted(async () => {
  console.log('App组件已挂载，开始初始化...')
  
  // 更新页面标题
  document.title = APP_TITLE
  
  // 等待飞书SDK加载完成
  const checkSDKAndInit = async () => {
    if (window.h5sdk && window.tt) {
      console.log('飞书SDK已加载，开始获取用户信息')
      await fetchUserInfo()
    } else {
      // alert("请在飞书应用中打开")
      await fetchUserInfo()
    }
    
    // 检查是否有保存的重定向路径（SDK免登成功后）
    const redirectPath = sessionStorage.getItem('redirectAfterLogin')
    if (redirectPath) {
      console.log('SDK免登后检测到重定向路径:', redirectPath)
      sessionStorage.removeItem('redirectAfterLogin') // 清除保存的路径
      router.push(redirectPath) // 跳转到用户原来想访问的页面
    }
  }
  const checkApiAndInit = async () => {
    // 处理授权码回调 - 清除URL参数避免重复处理
    console.log('检测到授权码，开始处理回调...');
    
    // 清除URL中的授权码参数
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    
    try {
      isLoading.value = true;
      const userData = await feishuAuth.handleAuthorizationCode(code, state);
      console.log("userData==", userData)
      console.log("userData.name==", userData.name)
      console.log("userData.avatar==", userData.avatar)
      console.log("userData.welcomeText==", userData.welcomeText)
      
      userInfo.value = {
        name: userData.name,
        avatar: userData.avatar,
        welcomeText: userData.welcomeText,
        rawData: userData.rawData || userData
      }
      console.log('userInfo.value = ', userInfo.value)
      
      // 清除加载状态和错误状态
      isLoading.value = false;
      loadError.value = null;
      
      // 检查是否有保存的重定向路径
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        console.log('检测到重定向路径:', redirectPath)
        sessionStorage.removeItem('redirectAfterLogin') // 清除保存的路径
        router.push(redirectPath) // 跳转到用户原来想访问的页面
      }
    } catch (error) {
      console.error('处理授权码失败:', error);
      // 设置错误状态
      loadError.value = error.message || '处理授权码失败';
      isLoading.value = false;
      // 不设置默认用户信息，保持用户信息为空
    }
  }

  // 检查URL中是否有授权码
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  
  console.log('URL参数检查:', { code, state, error });
  
  if (code) {
    checkApiAndInit()
  } else {
    checkSDKAndInit()
  }
})
</script>

<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-content">
        <!-- 左侧Logo -->
        <div class="logo-section">
          <img alt="Logo" class="logo" src="./assets/logo.svg" width="40" height="40" />
          <span class="app-title">{{ APP_TITLE }}</span>
        </div>
        
        <!-- 中间导航菜单 -->
        <nav class="nav-menu">
          <router-link 
            to="/" 
            class="nav-item" 
            :class="{ 'active': route.name === 'Home' }"
          >
            首页
          </router-link>
          <router-link 
            to="/recording" 
            class="nav-item" 
            :class="{ 'active': route.name === 'RecordingManagement' }"
          >
            录音管理
          </router-link>
        </nav>
        
        <!-- 右侧用户信息 -->
        <div class="user-section">
          <div class="user-info" :class="{ 'loading': isLoading, 'error': loadError }">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-indicator">
              <div class="loading-spinner"></div>
              <span class="user-name">加载中...</span>
            </div>
            <!-- 错误状态 -->
            <div v-else-if="loadError" class="error-indicator" @click="fetchUserInfo">
              <span class="user-name">点击重试</span>
            </div>
            <!-- 正常状态 -->
            <div v-else-if="userInfo.name" class="user-content">
              <img :src="userInfo.avatar" :alt="userInfo.name" class="user-avatar" />
              <span class="user-name">{{ userInfo.name }}</span>
              <!-- 登出按钮 -->
              <button @click="logout" class="logout-btn" title="登出">
                🚪
              </button>
            </div>
            <!-- 无用户信息状态 -->
            <div v-else class="error-indicator" @click="fetchUserInfo">
              <span class="user-name">点击登录</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>正在加载...</p>
        </div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="loadError" class="error-overlay">
        <div class="error-content">
          <h3>加载失败</h3>
          <p>{{ loadError }}</p>
          <button @click="fetchUserInfo" class="retry-btn">重试</button>
        </div>
      </div>
      
      <!-- 正常内容 -->
      <div v-else>
        <!-- 路由视图 -->
        <router-view :user-info="userInfo" />
      </div>
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏样式 */
.top-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
  overflow: hidden; /* 防止子元素溢出 */
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

/* 中间导航菜单 */
.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-item {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

/* 左侧Logo区域 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  border-radius: 8px;
}

.app-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 右侧用户信息区域 */
.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  /* 移除 backdrop-filter 避免溢出 */
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-info.loading {
  cursor: default;
}

.user-info.error {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.4);
}

.user-info.error:hover {
  background: rgba(255, 107, 107, 0.3);
}

/* 用户内容区域 */
.user-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.error-indicator:hover {
  opacity: 0.8;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-name {
  color: white;
  font-weight: 500;
  font-size: 14px;
}

.logout-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  margin-left: 8px;
}

.logout-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* 加载状态样式 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态样式 */
.error-icon {
  font-size: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 调试信息样式 */
.debug-info {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 12px;
  max-width: 300px;
  z-index: 1001;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  color: #ffd700;
}

.debug-info p {
  margin: 5px 0;
  word-break: break-all;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  margin-top: 60px; /* 为固定header留出空间 */
  padding: 20px;
  background: #f8fafc;
}

/* 加载和错误状态样式 */
.loading-overlay, .error-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  background: #f8fafc;
}

.loading-content, .error-content {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-content h3 {
  margin: 0 0 8px 0;
  color: #dc2626;
  font-size: 18px;
  font-weight: 600;
}

.error-content p {
  margin: 0 0 20px 0;
  color: #6b7280;
}

.retry-btn {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

/* 响应式设计 */
/* 超大屏幕 (1400px 及以上) */
@media (min-width: 1400px) {
  .header-content {
    max-width: 1400px;
  }
}

/* 大屏幕桌面 (1200px - 1399px) */
@media (min-width: 1200px) and (max-width: 1399px) {
  .header-content {
    padding: 0 24px;
  }
}

/* 中等屏幕/小桌面 (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .header-content {
    padding: 0 20px;
  }
  
  .app-title {
    font-size: 18px;
  }
}

/* 平板横屏 (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .header-content {
    padding: 0 16px;
  }
  
  .app-title {
    font-size: 16px;
  }
  
  .user-info {
    padding: 6px 10px;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
  }
  
  .user-name {
    font-size: 13px;
  }
}

/* 平板竖屏 (576px - 767px) */
@media (min-width: 576px) and (max-width: 767px) {
  .header-content {
    padding: 0 16px;
  }
  
  .app-title {
    font-size: 14px;
  }
  
  .nav-item {
    font-size: 14px;
    padding: 6px 12px;
  }
  
  .user-info {
    padding: 6px 8px;
  }
  
  .user-name {
    font-size: 12px;
  }
  
  .main-content {
    padding: 16px;
  }
}

/* 大手机 (480px - 575px) */
@media (min-width: 480px) and (max-width: 575px) {
  .header-content {
    padding: 0 12px;
  }
  
  .app-title {
    display: none;
  }
  
  .nav-item {
    font-size: 13px;
    padding: 5px 10px;
  }
  
  .user-name {
    font-size: 12px;
  }
  
  .main-content {
    padding: 12px;
  }
}

/* 小手机 (479px 及以下) */
@media (max-width: 479px) {
  .top-header {
    height: 56px; /* 稍微降低高度 */
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .logo {
    width: 32px;
    height: 32px;
  }
  
  .app-title {
    display: none;
  }
  
  .nav-item {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .user-info {
    padding: 4px 6px;
  }
  
  .user-avatar {
    width: 24px;
    height: 24px;
  }
  
  .user-name {
    display: none; /* 小屏幕只显示头像 */
  }
  
  .main-content {
    margin-top: 56px;
    padding: 10px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .user-info:hover {
    transform: none; /* 禁用hover效果 */
  }
  
  .user-info:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
