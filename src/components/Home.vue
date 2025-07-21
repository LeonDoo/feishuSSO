<script setup>
// 定义props
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">{{ props.userInfo.welcomeText || '欢迎回来！' }}</h1>
        <p class="welcome-subtitle">{{ props.userInfo.name || '用户' }}，今天是 {{ new Date().toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        }) }}</p>
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
  text-align: center;
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  max-width: 600px;
  margin: 0 auto;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 0 16px;
  }
  
  .welcome-section {
    padding: 30px 20px;
    margin-bottom: 20px;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .welcome-section {
    padding: 24px 16px;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .welcome-subtitle {
    font-size: 0.9rem;
  }
}
</style> 