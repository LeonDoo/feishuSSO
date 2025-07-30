<template>
  <div class="audio-player" v-if="visible">
    <div class="player-overlay"></div>
    <div class="player-container">
      <div class="player-header">
        <h3>{{ title || '' }}</h3>
        <button @click="closePlayer" class="close-btn">×</button>
      </div>
      
      <div class="player-content">
        <div class="recording-info" v-if="startTime || endTime">
          <div class="time-info">
            <div class="time-item">
              <span class="time-label">开始时间：</span>
              <span class="time-value">{{ formatDateTime(startTime) || '无数据' }}</span>
            </div>
            <div class="time-item">
              <span class="time-label">结束时间：</span>
              <span class="time-value">{{ formatDateTime(endTime) || '无数据' }}</span>
            </div>
          </div>
        </div>
        
        <div class="audio-info">
          <div class="controls-row">
            <button @click="togglePlay" class="play-btn" :class="{ playing: isPlaying }" :disabled="isLoading">
              <div v-if="isLoading" class="loading-spinner"></div>
              <svg v-else-if="!isPlaying" class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else class="pause-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
            
            <div class="progress-container">
              <input 
                type="range" 
                v-model="progress" 
                @input="seekTo"
                class="progress-bar"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div class="time-display">
              <span>{{ formatTime(currentTime) }}</span>
              <span class="time-separator">/</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  audioUrl: {
    type: String,
    default: ''
  },
  title: {
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

const emit = defineEmits(['close'])

const audio = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const isLoading = ref(false)

// 初始化音频元素
onMounted(() => {
  audio.value = new Audio()
  audio.value.volume = 0.5 // 固定音量
  
  // 监听音频事件
  audio.value.addEventListener('loadstart', handleLoadStart)
  audio.value.addEventListener('loadedmetadata', handleLoadedMetadata)
  audio.value.addEventListener('canplay', handleCanPlay)
  audio.value.addEventListener('timeupdate', handleTimeUpdate)
  audio.value.addEventListener('ended', handleEnded)
  audio.value.addEventListener('error', handleError)
})

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause()
    audio.value.removeEventListener('loadstart', handleLoadStart)
    audio.value.removeEventListener('loadedmetadata', handleLoadedMetadata)
    audio.value.removeEventListener('canplay', handleCanPlay)
    audio.value.removeEventListener('timeupdate', handleTimeUpdate)
    audio.value.removeEventListener('ended', handleEnded)
    audio.value.removeEventListener('error', handleError)
  }
})

// 监听音频URL变化
watch(() => props.audioUrl, (newUrl) => {
  if (newUrl && audio.value) {
    // 重置播放状态
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
    progress.value = 0
    isLoading.value = true
    
    audio.value.src = newUrl
    audio.value.load()
  }
})

// 监听可见性变化
watch(() => props.visible, (visible) => {
  if (visible) {
    // 调试信息
    console.log('音频播放器Props:', {
      startTime: props.startTime,
      endTime: props.endTime,
      title: props.title,
      audioUrl: props.audioUrl
    })
  }
  
  if (!visible && audio.value) {
    audio.value.pause()
    isPlaying.value = false
    // 关闭播放器时重置进度
    currentTime.value = 0
    progress.value = 0
  }
})

const handleLoadStart = () => {
  isLoading.value = true
}

const handleLoadedMetadata = () => {
  duration.value = audio.value.duration
}

const handleCanPlay = () => {
  isLoading.value = false
}

const handleTimeUpdate = () => {
  // 防止在拖拽过程中被覆盖
  if (Math.abs(audio.value.currentTime - currentTime.value) > 0.1) {
    currentTime.value = audio.value.currentTime
    progress.value = (currentTime.value / duration.value) * 100
  }
}

const handleEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  progress.value = 0
}

const handleError = (error) => {
  console.error('音频播放错误:', error)
  isLoading.value = false
  alert('音频播放失败，请检查音频文件是否可用')
}

const togglePlay = () => {
  if (!audio.value || !props.audioUrl || isLoading.value) return
  
  if (isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
  } else {
    audio.value.play().catch(error => {
      console.error('播放失败:', error)
      alert('播放失败，请稍后重试')
    })
    isPlaying.value = true
  }
}

const seekTo = () => {
  if (!audio.value || !duration.value) return
  
  const newTime = (progress.value / 100) * duration.value
  console.log('Seeking to:', {
    progress: progress.value,
    duration: duration.value,
    newTime: newTime,
    currentAudioTime: audio.value.currentTime
  })
  
  audio.value.currentTime = newTime
  currentTime.value = newTime
}



const closePlayer = () => {
  if (audio.value) {
    audio.value.pause()
    isPlaying.value = false
  }
  emit('close')
}

const formatTime = (time) => {
  if (!time || isNaN(time)) return '00:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

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
</script>

<style scoped>
.audio-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.player-container {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.player-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.player-content {
  padding: 20px;
}

.recording-info {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  min-width: 70px;
}

.time-value {
  font-size: 14px;
  color: #374151;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.audio-info {
  margin-bottom: 20px;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-container {
  flex: 1;
  position: relative;
}

.time-display {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 80px;
}

.time-separator {
  margin: 0 4px;
  color: #9ca3af;
}



.progress-bar {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.play-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.play-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.play-btn.playing {
  background: #ef4444;
}

.play-btn.playing:hover {
  background: #dc2626;
}

.play-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.play-btn:disabled:hover {
  background: #9ca3af;
  transform: none;
}

.play-icon, .pause-icon {
  width: 20px;
  height: 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}



@media (max-width: 480px) {
  .player-container {
    width: 95%;
    margin: 0 10px;
  }
  
  .player-header {
    padding: 12px 16px;
  }
  
  .player-content {
    padding: 16px;
  }
  
  .controls {
    gap: 16px;
  }
  
  .play-btn {
    width: 36px;
    height: 36px;
  }
  
  .play-icon, .pause-icon {
    width: 18px;
    height: 18px;
  }
}
</style> 