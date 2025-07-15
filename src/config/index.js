// 环境配置文件
const config = {
  // 开发环境配置
  development: {
    API_BASE_URL: 'http://localhost:8080/api/feishu/app',
    APP_TITLE: 'FFCRM系统 (开发环境)',
    ENV_NAME: 'development'
  },
  
  // 生产环境配置
  production: {
    API_BASE_URL: 'https://your-production-domain.com',
    APP_TITLE: 'FFCRM系统',
    ENV_NAME: 'production'
  },
  
  // 测试环境配置
  test: {
    API_BASE_URL: 'http://test.your-domain.com',
    APP_TITLE: 'FFCRM系统 (测试环境)',
    ENV_NAME: 'test'
  }
}

// 获取当前环境
const getEnv = () => {
  // 首先尝试从环境变量获取
  if (import.meta.env.MODE) {
    return import.meta.env.MODE
  }
  
  // 根据域名判断环境
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development'
  } else if (hostname.includes('test') || hostname.includes('staging')) {
    return 'test'
  } else {
    return 'production'
  }
}

// 获取当前环境的配置
const getCurrentConfig = () => {
  const env = getEnv()
  return config[env] || config.development
}

// 导出配置
export const APP_CONFIG = getCurrentConfig()

// 导出单独的配置项
export const API_BASE_URL = APP_CONFIG.API_BASE_URL
export const APP_TITLE = APP_CONFIG.APP_TITLE
export const ENV_NAME = APP_CONFIG.ENV_NAME

// 工具函数
export const isDevelopment = () => ENV_NAME === 'development'
export const isProduction = () => ENV_NAME === 'production'
export const isTest = () => ENV_NAME === 'test'

// 打印当前配置（开发环境）
if (isDevelopment()) {
  console.log('🔧 当前环境配置:', APP_CONFIG)
} 