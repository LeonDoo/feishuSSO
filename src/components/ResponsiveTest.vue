<script setup>
import { ref, onMounted } from 'vue'

const screenWidth = ref(0)
const currentBreakpoint = ref('')

const checkBreakpoint = () => {
  screenWidth.value = window.innerWidth
  
  if (screenWidth.value >= 1400) {
    currentBreakpoint.value = '超大屏幕'
  } else if (screenWidth.value >= 1200) {
    currentBreakpoint.value = '大屏幕桌面'
  } else if (screenWidth.value >= 992) {
    currentBreakpoint.value = '小桌面'
  } else if (screenWidth.value >= 768) {
    currentBreakpoint.value = '平板横屏'
  } else if (screenWidth.value >= 576) {
    currentBreakpoint.value = '平板竖屏'
  } else if (screenWidth.value >= 480) {
    currentBreakpoint.value = '大手机'
  } else {
    currentBreakpoint.value = '小手机'
  }
}

onMounted(() => {
  checkBreakpoint()
  window.addEventListener('resize', checkBreakpoint)
})
</script>

<template>
  <div class="debug-panel">
    <div class="debug-content">
      <div class="debug-title">📱 设备信息</div>
      <div class="debug-item">{{ currentBreakpoint }} ({{ screenWidth }}px)</div>
    </div>
  </div>
</template>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 15px;
  right: 15px;
  background: #000;
  color: #fff;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: monospace;
  z-index: 999999;
  border: 1px solid #333;
  min-width: 160px;
}

.debug-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #4ade80;
}

.debug-item {
  color: #60a5fa;
  font-size: 11px;
}

/* 确保在所有设备上都能看到 */
@media (max-width: 479px) {
  .debug-panel {
    bottom: 10px;
    right: 10px;
    font-size: 10px;
    padding: 8px 10px;
  }
}
</style> 