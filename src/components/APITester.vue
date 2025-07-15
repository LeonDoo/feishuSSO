<script setup>
import { ref } from 'vue'
import { API_BASE_URL, ENV_NAME } from '../config/index.js'

const apiStatus = ref({
  getAppId: { status: 'untested', message: '', data: null },
  callback: { status: 'untested', message: '', data: null },
  session: { status: 'untested', message: '', data: null }
})

const isVisible = ref(false)

// 当前API地址
const apiBaseUrl = API_BASE_URL

// 测试获取App ID接口
const testGetAppId = async () => {
  apiStatus.value.getAppId.status = 'testing'
  try {
    const response = await fetch(`${apiBaseUrl}/get_appid`)
    if (response.ok) {
      const data = await response.json()
      apiStatus.value.getAppId = {
        status: 'success',
        message: `成功获取App ID: ${data.appid}`,
        data: data
      }
    } else {
      apiStatus.value.getAppId = {
        status: 'error',
        message: `HTTP ${response.status}: ${response.statusText}`,
        data: null
      }
    }
  } catch (error) {
    apiStatus.value.getAppId = {
      status: 'error',
      message: `连接失败: ${error.message}`,
      data: null
    }
  }
}

// 测试session用户信息
const testSession = () => {
  apiStatus.value.session.status = 'testing'
  try {
    // 检查sessionStorage
    const sessionUserInfo = sessionStorage.getItem('feishu_user_info');
    // 检查localStorage
    const localUserInfo = localStorage.getItem('feishu_user_info');
    
    if (sessionUserInfo) {
      const userInfo = JSON.parse(sessionUserInfo);
      apiStatus.value.session = {
        status: 'success',
        message: `Session用户: ${userInfo.name} (sessionStorage)`,
        data: userInfo
      }
    } else if (localUserInfo) {
      const userInfo = JSON.parse(localUserInfo);
      apiStatus.value.session = {
        status: 'success',
        message: `Session用户: ${userInfo.name} (localStorage)`,
        data: userInfo
      }
    } else {
      apiStatus.value.session = {
        status: 'error',
        message: '未找到用户信息',
        data: null
      }
    }
  } catch (error) {
    apiStatus.value.session = {
      status: 'error',
      message: `检查失败: ${error.message}`,
      data: null
    }
  }
}

// 测试回调接口（使用测试code）
const testCallback = async () => {
  apiStatus.value.callback.status = 'testing'
  try {
    const testCode = 'test_authorization_code_12345'
    const response = await fetch(`${apiBaseUrl}/callback?code=${testCode}`)
    if (response.ok) {
      const data = await response.json()
      apiStatus.value.callback = {
        status: 'success',
        message: `用户信息: ${data.name || data.en_name}`,
        data: data
      }
    } else {
      apiStatus.value.callback = {
        status: 'error',
        message: `HTTP ${response.status}: ${response.statusText}`,
        data: null
      }
    }
  } catch (error) {
    apiStatus.value.callback = {
      status: 'error',
      message: `连接失败: ${error.message}`,
      data: null
    }
  }
}

// 测试所有接口
const testAllAPIs = async () => {
  await testGetAppId()
  await testCallback()
  testSession()
}

// 获取状态图标
const getStatusIcon = (status) => {
  switch (status) {
    case 'untested': return '⚪'
    case 'testing': return '🔄'
    case 'success': return '✅'
    case 'error': return '❌'
    default: return '⚪'
  }
}

// 获取状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case 'untested': return '#6b7280'
    case 'testing': return '#3b82f6'
    case 'success': return '#10b981'
    case 'error': return '#ef4444'
    default: return '#6b7280'
  }
}
</script>

<template>
  <!-- 测试工具触发按钮 -->
  <div class="api-tester-trigger" @click="isVisible = !isVisible">
    🔧 API测试
  </div>

  <!-- 测试工具面板 -->
  <div v-if="isVisible" class="api-tester-panel">
    <div class="panel-header">
      <h3>后端接口测试</h3>
      <button @click="isVisible = false" class="close-btn">✕</button>
    </div>
    
    <div class="panel-content">
      <div class="test-section">
        <button @click="testAllAPIs" class="test-all-btn">
          🚀 测试所有接口
        </button>
      </div>

      <div class="api-list">
        <!-- GET /get_appid -->
        <div class="api-item">
          <div class="api-header">
            <span class="status-icon">{{ getStatusIcon(apiStatus.getAppId.status) }}</span>
            <span class="api-name">GET /get_appid</span>
            <button @click="testGetAppId" class="test-btn">测试</button>
          </div>
          <div class="api-result" :style="{ color: getStatusColor(apiStatus.getAppId.status) }">
            {{ apiStatus.getAppId.message || '未测试' }}
          </div>
        </div>

        <!-- Session用户信息 -->
        <div class="api-item">
          <div class="api-header">
            <span class="status-icon">{{ getStatusIcon(apiStatus.session.status) }}</span>
            <span class="api-name">Session用户信息</span>
            <button @click="testSession" class="test-btn">测试</button>
          </div>
          <div class="api-result" :style="{ color: getStatusColor(apiStatus.session.status) }">
            {{ apiStatus.session.message || '未测试' }}
          </div>
        </div>

        <!-- GET /callback -->
        <div class="api-item">
          <div class="api-header">
            <span class="status-icon">{{ getStatusIcon(apiStatus.callback.status) }}</span>
            <span class="api-name">GET /callback?code=test</span>
            <button @click="testCallback" class="test-btn">测试</button>
          </div>
          <div class="api-result" :style="{ color: getStatusColor(apiStatus.callback.status) }">
            {{ apiStatus.callback.message || '未测试' }}
          </div>
        </div>
      </div>

      <div class="help-text">
        <p>🌍 当前环境：{{ ENV_NAME }}</p>
        <p>🔗 API地址：{{ apiBaseUrl }}</p>
        <p>💡 提示：确保后端服务正常运行</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.api-tester-trigger {
  position: fixed;
  bottom: 80px;
  right: 15px;
  background: #3b82f6;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  z-index: 999998;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.api-tester-trigger:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.api-tester-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 999999;
  min-width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
}

.close-btn:hover {
  color: #ef4444;
}

.panel-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.test-section {
  margin-bottom: 20px;
  text-align: center;
}

.test-all-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.test-all-btn:hover {
  background: #059669;
}

.api-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.api-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #f9fafb;
}

.api-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.status-icon {
  font-size: 16px;
  width: 20px;
}

.api-name {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  color: #374151;
}

.test-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.test-btn:hover {
  background: #2563eb;
}

.api-result {
  font-size: 12px;
  font-family: monospace;
  padding: 4px 0;
}

.help-text {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.help-text p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

/* 移动端适配 */
@media (max-width: 479px) {
  .api-tester-trigger {
    bottom: 70px;
    right: 10px;
    font-size: 11px;
    padding: 6px 10px;
  }

  .api-tester-panel {
    min-width: 90vw;
    max-height: 90vh;
  }

  .panel-content {
    padding: 16px;
  }

  .api-header {
    flex-wrap: wrap;
    gap: 6px;
  }

  .api-name {
    font-size: 11px;
  }
}
</style> 