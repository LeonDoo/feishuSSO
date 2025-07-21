<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>页面未找到</h1>
      <p>抱歉，您访问的页面不存在。</p>
      <router-link to="/" class="home-link">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
// 无需额外的逻辑
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8fafc;
}

.not-found-content {
  text-align: center;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 20px;
  line-height: 1;
}

.not-found h1 {
  font-size: 32px;
  color: #111827;
  margin-bottom: 16px;
  font-weight: 600;
}

.not-found p {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 32px;
}

.home-link {
  display: inline-block;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.home-link:hover {
  background: #2563eb;
  transform: translateY(-1px);
}
</style> 