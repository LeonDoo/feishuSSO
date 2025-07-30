<template>
  <div class="recording-management">
    <!-- 用户信息加载状态 -->
    <div v-if="userLoading" class="user-loading">
      <div class="loading-spinner"></div>
      <span>正在获取用户信息...</span>
    </div>
    
    <div v-else-if="userError" class="user-error">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <h3>用户信息获取失败</h3>
        <p>{{ userError }}</p>
        <button @click="fetchUserInfo" class="retry-btn">重试</button>
      </div>
    </div>
    
    <div v-else>
      <div class="page-header">
        <h1>录音管理</h1>
      </div>

      <!-- 搜索条件 -->
      <div class="search-section">
        <div class="search-item">
          <label class="search-label">日期范围：</label>
          <input 
            type="date" 
            v-model="searchDate" 
            @change="handleDateChange"
            class="date-input"
          />
        </div>
        <div class="search-item">
          <button @click="searchRecordings" class="search-btn" :disabled="loading">
            {{ loading ? '搜索中...' : '搜索' }}
          </button>
        </div>
      </div>

      <!-- 录音列表 -->
      <div class="recording-list">
        <div class="table-container">
          <table class="recording-table">
            <thead>
              <tr>
                <th>客户</th>
                <th>开始时间</th>
                <th>结束时间</th>
                <th>时长</th>
                <th>操作</th>
              </tr>
            </thead>
                      <tbody>
            <tr v-if="loading" class="loading-row">
              <td colspan="5" class="loading-cell">
                <div class="loading-spinner"></div>
                <span>加载中...</span>
              </td>
            </tr>
            <tr v-else-if="recordingsError" class="error-row">
              <td colspan="5" class="error-cell">
                <div class="error-content">
                  <div class="error-icon">❌</div>
                  <div class="error-text">
                    <h4>获取录音列表失败</h4>
                    <p>{{ recordingsError }}</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-else-if="recordings.length === 0" class="empty-row">
              <td colspan="5" class="empty-cell">
                暂无录音数据
              </td>
            </tr>
              <tr v-else v-for="recording in recordings" :key="recording.id" class="recording-row">
                <td class="customer-cell">
                  <button 
                    @click="openCustomerModal(recording)"
                    class="customer-btn"
                    :class="{ 'has-customer': recording.customer }"
                  >
                    {{ recording.customer ? recording.customer.name : '选择客户' }}
                  </button>
                </td>
                <td class="time-cell">{{ formatDateTime(recording.startTime) }}</td>
                <td class="time-cell">{{ formatDateTime(recording.endTime) }}</td>
                <td class="duration-cell">{{ formatDuration(recording.duration) }}</td>
                <td class="action-cell">
                  <div class="action-buttons">
                    <button 
                      @click="playRecording(recording)"
                      class="play-btn"
                      :disabled="!recording.url"
                      :title="recording.url ? '播放录音' : '录音文件不可用'"
                    >
                      ▶️
                    </button>
                    <button 
                      @click="downloadRecording(recording)"
                      class="download-btn"
                      :disabled="!recording.url"
                      :title="recording.url ? '下载录音' : '录音文件不可用'"
                    >
                      📥
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="changePage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="page-btn"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页
          </span>
          <button 
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="page-btn"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- 客户选择弹窗 -->
      <CustomerSelectModal
        :visible="customerModalVisible"
        :default-search="currentRecording?.contactAlias || currentRecording?.customer?.name || ''"
        :start-time="getCurrentStartTime()"
        :end-time="getCurrentEndTime()"
        @close="closeCustomerModal"
        @confirm="handleCustomerSelect"
      />

      <!-- 音频播放器 -->
      <AudioPlayer
        :visible="audioPlayerVisible"
        :audio-url="currentAudioUrl"
        :title="currentAudioTitle"
        :start-time="currentRecording?.startTime || ''"
        :end-time="currentRecording?.endTime || ''"
        @close="closeAudioPlayer"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import CustomerSelectModal from './CustomerSelectModal.vue'
import AudioPlayer from './AudioPlayer.vue'
import { feishuAuth } from '../utils/feishuAuth.js'
import { API_BASE_URL } from '../config/index.js'
import { getAuthHeaders } from '../utils/auth.js'

// 响应式数据
const recordings = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const total = ref(0)

// 搜索条件
const searchDate = ref('')

// 用户信息状态
const userInfo = ref(null)
const userLoading = ref(true)
const userError = ref(null)

// 录音列表错误状态
const recordingsError = ref(null)

// 客户选择弹窗
const customerModalVisible = ref(false)
const currentRecording = ref(null)

// 音频播放器
const audioPlayerVisible = ref(false)
const currentAudioUrl = ref('')
const currentAudioTitle = ref('')

// 获取录音列表
const fetchRecordings = async () => {
  loading.value = true
  recordingsError.value = null // 清除之前的错误
  
  try {
    // 使用用户选择的日期，如果没有选择则使用今天
    let startTime, endTime
    if (searchDate.value) {
      startTime = `${searchDate.value} 00:00:00`
      endTime = `${searchDate.value} 23:59:59`
    } else {
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      startTime = `${todayStr} 00:00:00`
      endTime = `${todayStr} 23:59:59`
    }
    
    const response = await fetch(`${API_BASE_URL}/ab/page`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        pageNumber: currentPage.value,
        pageSize: pageSize.value,
        startTime: startTime,
        endTime: endTime
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.code === 200) {
      recordings.value = result.data.data.map(item => ({
        ...item,
        customer: null // 初始化为空，后续可以根据contactAlias等信息匹配客户
      }))
      totalPages.value = result.data.totalPages
      total.value = result.data.total
      
      // 根据contactAlias自动匹配客户（如果有的话）
      recordings.value.forEach(recording => {
        if (recording.contactAlias) {
          // 根据contactAlias和contactWxId创建客户信息
          recording.customer = {
            id: recording.id, // 使用录音ID作为临时客户ID
            name: recording.contactAlias,
            alias: recording.contactAlias,
            wxId: recording.contactWxId || ''
          }
        }
      })
    } else {
      throw new Error(result.message || '获取录音列表失败')
    }
  } catch (error) {
    console.error('获取录音列表失败:', error)
    
    // 根据错误类型设置不同的错误信息
    let errorMessage = '获取录音列表失败'
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = '后端服务器未启动，请检查服务状态'
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      errorMessage = '网络连接失败，请检查网络连接'
    } else if (error.message.includes('HTTP error! status:')) {
      const status = error.message.match(/status: (\d+)/)?.[1]
      if (status === '404') {
        errorMessage = '录音列表接口不存在，请检查API地址'
      } else if (status === '500') {
        errorMessage = '服务器内部错误，请稍后重试'
      } else {
        errorMessage = `服务器错误 (${status})`
      }
    } else {
      errorMessage = error.message || '获取录音列表失败'
    }
    
    recordingsError.value = errorMessage
    recordings.value = []
    total.value = 0
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}



// 处理日期变化
const handleDateChange = () => {
  // 日期变化时重置到第一页
  currentPage.value = 1
}

// 搜索录音
const searchRecordings = () => {
  currentPage.value = 1
  recordingsError.value = null // 清除错误状态
  fetchRecordings()
}



// 切换页面
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    recordingsError.value = null // 清除错误状态
    fetchRecordings()
  }
}

// 打开客户选择弹窗
const openCustomerModal = (recording) => {
  currentRecording.value = recording
  customerModalVisible.value = true
}

// 关闭客户选择弹窗
const closeCustomerModal = () => {
  customerModalVisible.value = false
  currentRecording.value = null
}

// 处理客户选择
const handleCustomerSelect = async (customer) => {
  if (currentRecording.value) {
    try {
      if (customer) {
        // 有选中客户，调用绑定联系人接口
        const response = await fetch(`${API_BASE_URL}/ab/bindContact`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            id: currentRecording.value.id,
            contactWxId: customer.wxId
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.code === 200) {
          // 绑定成功，更新本地数据
          currentRecording.value.customer = customer
          console.log('客户绑定成功:', customer.name)
        } else {
          throw new Error(result.message || '绑定客户失败')
        }
      } else {
        // 没有选中客户，调用绑定接口但不传contactWxId参数来清除绑定
        const response = await fetch(`${API_BASE_URL}/ab/bindContact`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            id: currentRecording.value.id
            // 不传contactWxId参数，后端会清除绑定
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.code === 200) {
          // 清除绑定成功，更新本地数据
          currentRecording.value.customer = null
          console.log('客户绑定已清除')
        } else {
          throw new Error(result.message || '清除客户绑定失败')
        }
      }
      
      // 关闭客户选择弹窗
      closeCustomerModal()
      
      // 刷新录音列表
      await fetchRecordings()
    } catch (error) {
      console.error('绑定客户失败:', error)
      // 可以在这里添加错误提示
      alert('绑定客户失败: ' + error.message)
      // 关闭客户选择弹窗
      closeCustomerModal()
    }
  }
}

// 播放录音
const playRecording = (recording) => {
  if (!recording.url) {
    alert('录音文件不可用')
    return
  }
  
  currentRecording.value = recording
  currentAudioUrl.value = recording.url
  currentAudioTitle.value = recording.customer ? `${recording.customer.name}` : '未选择客户'
  audioPlayerVisible.value = true
  
  // 调试信息
  console.log('播放录音数据:', {
    startTime: recording.startTime,
    endTime: recording.endTime,
    url: recording.url
  })
}

// 关闭音频播放器
const closeAudioPlayer = () => {
  audioPlayerVisible.value = false
  currentAudioUrl.value = ''
  currentAudioTitle.value = ''
}

// 下载录音
const downloadRecording = (recording) => {
  if (recording.url) {
    try {
      const link = document.createElement('a')
      link.href = recording.url
      link.download = recording.filename || 'recording.mp3'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('开始下载录音:', recording.filename)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请稍后重试')
    }
  } else {
    alert('下载链接不可用')
  }
}

// 获取当前开始时间
const getCurrentStartTime = () => {
  if (searchDate.value) {
    return `${searchDate.value} 00:00:00`
  }
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`
}

// 获取当前结束时间
const getCurrentEndTime = () => {
  if (searchDate.value) {
    return `${searchDate.value} 23:59:59`
  }
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 23:59:59`
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    userLoading.value = true
    userError.value = null
    
    const userData = await feishuAuth.checkLoginAndGetUser()
    userInfo.value = userData
    
    // 路由守卫已确保用户已登录，这里只需要处理获取失败的情况
    if (!userData || !userData.rawData) {
      userError.value = '用户信息获取失败，请重新登录'
      return false
    }
    
    return true
  } catch (error) {
    console.error('获取用户信息失败:', error)
    userError.value = '用户信息获取失败，请重新登录'
    return false
  } finally {
    userLoading.value = false
  }
}





// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 格式化时长
const formatDuration = (durationMs) => {
  if (!durationMs) return '00:00:00'
  const totalSeconds = Math.floor(durationMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 组件挂载时获取数据
onMounted(async () => {
  // 获取用户信息（路由守卫已确保用户已登录）
  await fetchUserInfo()
  
  // 设置默认日期为今天
  const today = new Date()
  searchDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  fetchRecordings()
})
</script>

<style scoped>
.recording-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 600;
}



/* 搜索区域样式 */
.search-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.date-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-btn {
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover:not(:disabled) {
  background: #059669;
}

.search-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}



/* 用户登录状态样式 */
.user-loading, .user-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.user-loading {
  color: #6b7280;
}

.user-loading .loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.user-error {
  color: #dc2626;
}

.user-error .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.user-error .error-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.user-error .error-content p {
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

.recording-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
    margin: 0 -16px;
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .table-container {
    margin: 0 -12px;
    padding: 0 12px;
  }
}

.recording-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.recording-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
}

.recording-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  color: #111827;
}

.recording-row:hover {
  background: #f9fafb;
}

.loading-row, .empty-row {
  text-align: center;
}

.loading-cell, .empty-cell, .error-cell {
  padding: 40px 20px;
  color: #374151;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态样式 */
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 32px;
  color: #dc2626;
}

.error-text h4 {
  margin: 0 0 8px 0;
  color: #dc2626;
  font-size: 16px;
  font-weight: 600;
}

.error-text p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  max-width: 400px;
  line-height: 1.5;
}

.customer-btn {
  background: none;
  border: 1px solid #d1d5db;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  transition: all 0.2s;
}

.customer-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.customer-btn.has-customer {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
  font-weight: 500;
}



.time-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #111827;
}

.duration-cell {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #111827;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  padding-left: 0;
  margin-left: -8px;
}

.play-btn, .download-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.play-btn:hover:not(:disabled) {
  background: #f3f4f6;
  transform: scale(1.1);
}

.download-btn:hover:not(:disabled) {
  background: #f0f9ff;
  transform: scale(1.1);
}

.play-btn:disabled, .download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.page-btn:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .recording-management {
    padding: 16px;
    overflow-x: hidden;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .search-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .search-label {
    text-align: left;
  }
  
  .recording-table th,
  .recording-table td {
    padding: 8px 8px;
    font-size: 12px;
  }
  

  
  .customer-btn {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .action-buttons {
    gap: 4px;
    margin-left: -4px;
  }
  
  .play-btn, .download-btn {
    padding: 4px;
    font-size: 14px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}

/* 更小屏幕优化 */
@media (max-width: 480px) {
  .recording-management {
    padding: 12px;
  }
  
  .recording-table th,
  .recording-table td {
    padding: 6px 4px;
    font-size: 11px;
  }
  

  
  .time-cell, .duration-cell {
    font-size: 10px;
  }
  
  .customer-btn {
    padding: 3px 6px;
    font-size: 11px;
  }
  
  .action-buttons {
    gap: 2px;
    margin-left: -2px;
  }
  
  .play-btn, .download-btn {
    padding: 3px;
    font-size: 12px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .search-section {
    padding: 12px;
  }
}
</style> 