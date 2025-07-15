<script setup>
import { ref } from 'vue'

// 模拟一些统计数据
const stats = ref([
  { title: '客户总数', value: '1,234', icon: '👥', color: '#3b82f6' },
  { title: '今日新增', value: '25', icon: '➕', color: '#10b981' },
  { title: '跟进中', value: '89', icon: '📞', color: '#f59e0b' },
  { title: '本月成交', value: '156', icon: '💰', color: '#ef4444' }
])

const quickActions = ref([
  { name: '新建客户', icon: '👤', color: '#3b82f6' },
  { name: '客户跟进', icon: '📋', color: '#10b981' },
  { name: '销售机会', icon: '🎯', color: '#f59e0b' },
  { name: '报表分析', icon: '📊', color: '#8b5cf6' }
])

// 处理快捷操作点击
const handleAction = (actionName) => {
  // 这里可以根据不同的操作进行路由跳转或其他处理
  alert(`点击了：${actionName}`)
}
</script>

<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎回来！</h1>
        <p class="welcome-subtitle">今天是 {{ new Date().toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        }) }}</p>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <div class="section-title">数据概览</div>
      <div class="stats-grid">
        <div 
          v-for="stat in stats" 
          :key="stat.title"
          class="stat-card"
          :style="{ borderLeftColor: stat.color }"
        >
          <div class="stat-icon" :style="{ color: stat.color }">
            {{ stat.icon }}
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-title">{{ stat.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作区域 -->
    <div class="actions-section">
      <div class="section-title">快捷操作</div>
      <div class="actions-grid">
        <div 
          v-for="action in quickActions" 
          :key="action.name"
          class="action-card"
          @click="handleAction(action.name)"
        >
          <div class="action-icon" :style="{ backgroundColor: action.color }">
            {{ action.icon }}
          </div>
          <div class="action-name">{{ action.name }}</div>
        </div>
      </div>
    </div>

    <!-- 最近活动区域 -->
    <div class="activity-section">
      <div class="section-title">最近活动</div>
      <div class="activity-list">
        <div class="activity-item">
          <div class="activity-icon">📞</div>
          <div class="activity-content">
            <div class="activity-text">与客户李四进行了通话跟进</div>
            <div class="activity-time">2小时前</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">👤</div>
          <div class="activity-content">
            <div class="activity-text">新增客户王五的联系信息</div>
            <div class="activity-time">4小时前</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon">💰</div>
          <div class="activity-content">
            <div class="activity-text">完成与赵六的销售合同签订</div>
            <div class="activity-time">1天前</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
  text-align: center;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* 章节标题 */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid #3b82f6;
}

/* 统计卡片区域 */
.stats-section {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-title {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 4px;
}

/* 快捷操作区域 */
.actions-section {
  margin-bottom: 40px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 16px;
  color: white;
}

.action-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

/* 最近活动区域 */
.activity-section {
  margin-bottom: 40px;
}

.activity-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background-color: #f9fafb;
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #1f2937;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  color: #6b7280;
  font-size: 0.875rem;
}

/* 响应式设计 */
/* 超大屏幕 (1400px 及以上) */
@media (min-width: 1400px) {
  .home-container {
    max-width: 1400px;
    padding: 0 24px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}

/* 大屏幕桌面 (1200px - 1399px) */
@media (min-width: 1200px) and (max-width: 1399px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

/* 中等屏幕/小桌面 (992px - 1199px) */
@media (min-width: 992px) and (max-width: 1199px) {
  .home-container {
    padding: 0 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
  
  .welcome-title {
    font-size: 2.2rem;
  }
}

/* 平板横屏 (768px - 991px) */
@media (min-width: 768px) and (max-width: 991px) {
  .home-container {
    padding: 0 16px;
  }
  
  .welcome-section {
    padding: 32px 24px;
    margin-bottom: 24px;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-card,
  .action-card {
    padding: 20px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
}

/* 平板竖屏 (576px - 767px) */
@media (min-width: 576px) and (max-width: 767px) {
  .home-container {
    padding: 0 16px;
  }
  
  .welcome-section {
    padding: 28px 20px;
    margin-bottom: 20px;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .welcome-subtitle {
    font-size: 0.95rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  
  .stat-card {
    padding: 18px;
    gap: 12px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.6rem;
  }
  
  .action-card {
    padding: 18px;
  }
  
  .action-icon {
    width: 50px;
    height: 50px;
    font-size: 1.3rem;
    margin-bottom: 12px;
  }
  
  .section-title {
    font-size: 1.2rem;
    margin-bottom: 16px;
  }
}

/* 大手机 (480px - 575px) */
@media (min-width: 480px) and (max-width: 575px) {
  .home-container {
    padding: 0 12px;
  }
  
  .welcome-section {
    padding: 24px 16px;
    margin-bottom: 18px;
  }
  
  .welcome-title {
    font-size: 1.6rem;
  }
  
  .welcome-subtitle {
    font-size: 0.9rem;
  }
  
  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
    gap: 12px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 1.4rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-title {
    font-size: 0.85rem;
  }
  
  .action-card {
    padding: 20px;
  }
  
  .action-icon {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
  
  .action-name {
    font-size: 0.95rem;
  }
  
  .section-title {
    font-size: 1.15rem;
    margin-bottom: 14px;
  }
  
  .activity-item {
    padding: 16px 18px;
  }
  
  .activity-icon {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
  }
}

/* 小手机 (479px 及以下) */
@media (max-width: 479px) {
  .home-container {
    padding: 0 10px;
  }
  
  .welcome-section {
    padding: 20px 12px;
    margin-bottom: 16px;
  }
  
  .welcome-title {
    font-size: 1.4rem;
  }
  
  .welcome-subtitle {
    font-size: 0.8rem;
  }
  
  .section-title {
    font-size: 1.1rem;
    margin-bottom: 12px;
    padding-left: 8px;
  }
  
  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stat-card {
    padding: 14px;
    gap: 10px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .stat-value {
    font-size: 1.3rem;
  }
  
  .stat-title {
    font-size: 0.8rem;
  }
  
  .action-card {
    padding: 16px;
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
  
  .action-name {
    font-size: 0.9rem;
  }
  
  .stats-section,
  .actions-section,
  .activity-section {
    margin-bottom: 20px;
  }
  
  .activity-item {
    padding: 12px 14px;
    gap: 12px;
  }
  
  .activity-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .activity-text {
    font-size: 0.9rem;
  }
  
  .activity-time {
    font-size: 0.75rem;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .stat-card:hover,
  .action-card:hover,
  .activity-item:hover {
    transform: none;
  }
  
  .action-card:active {
    transform: scale(0.98);
    transition: transform 0.1s;
  }
  
  .stat-card:active {
    transform: scale(0.995);
    transition: transform 0.1s;
  }
  
  /* 增加触摸目标大小 */
  .action-card {
    min-height: 120px;
  }
  
  .activity-item {
    min-height: 60px;
  }
}
</style> 