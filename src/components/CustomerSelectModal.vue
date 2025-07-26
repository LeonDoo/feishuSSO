<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>选择客户</h3>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 搜索框 -->
        <div class="search-section">
          <input 
            v-model="searchKeyword" 
            @input="handleInput"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            @keyup.enter="handleSearch"
            placeholder="请输入客户微信昵称或备注"
            class="search-input"
          />
          <button @click="handleSearch" class="search-btn">搜索</button>
        </div>
        
        <!-- 搜索结果列表 -->
        <div class="customer-list">
          <div v-if="loading" class="loading">搜索中...</div>
          <div v-else-if="customers.length === 0" class="no-data">暂无搜索结果</div>
          <div v-else class="customer-items">
            <div 
              v-for="customer in customers" 
              :key="customer.id"
              class="customer-item"
              :class="{ 'selected': selectedCustomer?.id === customer.id }"
              @click="selectCustomer(customer)"
            >
              <div class="customer-info">
                <div class="customer-name">{{ customer.name }}</div>
                <div class="customer-alias" v-if="customer.alias && customer.alias !== customer.name">{{ customer.alias }}</div>
                <div class="customer-wxid">{{ customer.wxId }}</div>
              </div>
              <div class="select-indicator">
                <span v-if="selectedCustomer?.id === customer.id" class="selected-check">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeModal" class="cancel-btn" :disabled="binding">取消</button>
        <button @click="confirmSelection" class="confirm-btn" :disabled="binding">
          {{ binding ? '绑定中...' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { API_BASE_URL } from '../config/index.js'
import { getAuthHeaders } from '../utils/auth.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  defaultSearch: {
    type: String,
    default: ''
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'confirm'])

// 响应式数据
const searchKeyword = ref('')
const customers = ref([])
const selectedCustomer = ref(null)
const loading = ref(false)
const binding = ref(false)
const searchTimeout = ref(null)
const isComposing = ref(false)

// 监听默认搜索关键词
watch(() => props.defaultSearch, (newValue) => {
  if (newValue) {
    searchKeyword.value = newValue
    handleSearch()
  }
})

// 处理输入事件（防抖）
const handleInput = () => {
  // 如果正在输入法编辑中，不执行搜索
  if (isComposing.value) {
    return
  }
  
  // 清除之前的定时器
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  // 设置新的定时器，500ms后执行搜索
  searchTimeout.value = setTimeout(() => {
    handleSearch()
  }, 500)
}

// 输入法开始编辑
const handleCompositionStart = () => {
  isComposing.value = true
  console.log('输入法开始编辑')
}

// 输入法结束编辑
const handleCompositionEnd = () => {
  isComposing.value = false
  console.log('输入法结束编辑')
  // 输入法结束后立即搜索
  handleSearch()
}

// 监听弹窗显示状态
watch(() => props.visible, (newValue) => {
  if (newValue) {
    if (props.defaultSearch) {
      searchKeyword.value = props.defaultSearch
      handleSearch()
    } else {
      // 如果没有默认搜索，清空搜索框并查询默认客户列表
      searchKeyword.value = ''
      fetchDefaultCustomers()
    }
    // 重置绑定状态
    binding.value = false
  }
})

// 获取时间范围
const getTimeRange = () => {
  if (props.startTime && props.endTime) {
    return {
      startTime: props.startTime,
      endTime: props.endTime
    }
  }
  const today = new Date()
  const startTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`
  const endTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 23:59:59`
  return { startTime, endTime }
}

// 调用客户API
const callCustomerAPI = async (contactAlias = null) => {
  const { startTime, endTime } = getTimeRange()
  
  const requestBody = {
    startTime: startTime,
    endTime: endTime
  }
  
  // 如果有搜索关键词，添加到请求体中
  if (contactAlias) {
    requestBody.contactAlias = contactAlias
  }
  
      const response = await fetch(`${API_BASE_URL}/ab/contactList`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody)
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const result = await response.json()
  
  if (result.code === 200) {
    // 转换API响应格式为组件需要的格式
    customers.value = result.data.map((customer, index) => ({
      id: index + 1, // 使用索引作为临时ID
      name: customer.nickName, // 使用nickName作为主要显示名称
      alias: customer.alias || customer.nickName, // alias可能为空，使用nickName作为备选
      wxId: customer.wxId
    }))
    
    // 如果有默认搜索，自动选择第一个匹配的结果
    if (props.defaultSearch && customers.value.length > 0) {
      selectedCustomer.value = customers.value[0]
    }
  } else {
    throw new Error(result.message || '获取客户列表失败')
  }
}

// 搜索客户
const handleSearch = async () => {
  loading.value = true
  try {
    if (!searchKeyword.value.trim()) {
      // 当什么都不输入时，默认查询20条
      await callCustomerAPI()
    } else {
      // 有搜索关键词时，传递关键词
      await callCustomerAPI(searchKeyword.value)
    }
  } catch (error) {
    console.error('搜索客户失败:', error)
    customers.value = []
  } finally {
    loading.value = false
  }
}

// 默认查询客户列表
const fetchDefaultCustomers = async () => {
  loading.value = true
  try {
    await callCustomerAPI()
  } catch (error) {
    console.error('获取默认客户列表失败:', error)
    customers.value = []
  } finally {
    loading.value = false
  }
}

// 选择客户
const selectCustomer = (customer) => {
  // 如果点击的是已选中的客户，则取消选中
  if (selectedCustomer.value?.id === customer.id) {
    selectedCustomer.value = null
  } else {
    // 否则选中该客户
    selectedCustomer.value = customer
  }
}

// 确认选择
const confirmSelection = () => {
  binding.value = true
  // 如果有选中的客户，则绑定该客户；如果没有选中客户，则传递null表示不绑定
  emit('confirm', selectedCustomer.value)
  // 不立即关闭弹窗，等待绑定完成
}

// 关闭弹窗
const closeModal = () => {
  // 清理定时器
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
  
  searchKeyword.value = ''
  customers.value = []
  selectedCustomer.value = null
  loading.value = false
  binding.value = false
  isComposing.value = false
  emit('close')
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-btn {
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background: #2563eb;
}

.customer-list {
  min-height: 200px;
}

.loading, .no-data {
  text-align: center;
  color: #6b7280;
  padding: 40px 20px;
  font-size: 14px;
}

.customer-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.customer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.customer-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.customer-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.customer-info {
  flex: 1;
}

.customer-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
  font-size: 12px;
}

.customer-alias {
  font-size: 15px;
  color: #059669;
  margin-bottom: 4px;
  font-style: italic;
  font-weight: 500;
}

.customer-wxid {
  font-size: 12px;
  color: #6b7280;
}

.select-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  transition: all 0.2s;
}

.customer-item.selected .select-indicator {
  background: #3b82f6;
  border-color: #3b82f6;
}

.selected-check {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn, .confirm-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.confirm-btn {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.confirm-btn:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}
</style> 