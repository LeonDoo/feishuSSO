<script setup>
import { ref, onMounted } from 'vue'
import Home from './components/Home.vue'
import ResponsiveTest from './components/ResponsiveTest.vue'
import APITester from './components/APITester.vue'
import { feishuAuth } from './utils/feishuAuth.js'
import { APP_TITLE, ENV_NAME } from './config/index.js'

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
    } else {
      loadError.value = error.message || '获取用户信息失败'
    }
    
    // 设置默认用户信息
    userInfo.value = {
      name: '游客用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
      welcomeText: '请启动后端服务'
    }
  } finally {
    isLoading.value = false
  }
}

// 登出功能
const logout = () => {
  feishuAuth.clearUserInfo()
  userInfo.value = {
    name: '游客用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
    welcomeText: '已登出'
  }
  loadError.value = null
  console.log('用户已登出')
}

// 清除Session功能（用于调试）
const clearSession = () => {
  feishuAuth.clearUserInfo()
  userInfo.value = {
    name: '游客用户',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
    welcomeText: 'Session已清除'
  }
  loadError.value = null
  isLoading.value = false
  console.log('Session已清除')
}

// 组件挂载时获取用户信息
onMounted(async () => {
  console.log('App组件已挂载，开始初始化...')
  
  // 更新页面标题
  document.title = APP_TITLE
  
  // 等待飞书SDK加载完成
  const checkSDKAndInit = () => {
    if (window.h5sdk && window.tt) {
      console.log('飞书SDK已加载，开始获取用户信息')
      fetchUserInfo()
    } else {
      // alert("请在飞书应用中打开")
      fetchUserInfo()
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
        name: userData.name || '未知用户',
        avatar: userData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown',
        welcomeText: userData.welcomeText || '欢迎使用',
        rawData: userData.rawData || userData
      }
      console.log('userInfo.value = ', userInfo.value)
      
      // 清除加载状态和错误状态
      isLoading.value = false;
      loadError.value = null;
    } catch (error) {
      console.error('处理授权码失败:', error);
      // 设置错误状态
      loadError.value = error.message || '处理授权码失败';
      isLoading.value = false;
      // 设置默认用户信息
      userInfo.value = {
        name: '游客用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
        welcomeText: '授权失败'
      }
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
              <div class="error-icon">⚠️</div>
              <span class="user-name">点击重试</span>
            </div>
            <!-- 正常状态 -->
            <div v-else class="user-content">
              <img :src="userInfo.avatar" :alt="userInfo.name" class="user-avatar" />
              <span class="user-name">{{ userInfo.name }}</span>
              <!-- 登出按钮（仅在有用户信息时显示） -->
              <button v-if="userInfo.name !== '游客用户'" @click="logout" class="logout-btn" title="登出">
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <Home />
    </main>
    
    <!-- 响应式测试信息 (开发环境下显示) -->
    <ResponsiveTest />
    
    <!-- API接口测试工具 -->
    <APITester />
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
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
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
.user-content,
.loading-indicator,
.error-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
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
