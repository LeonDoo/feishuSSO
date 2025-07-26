// 认证工具函数
export const getAuthToken = () => {
  try {
    // 首先尝试从 sessionStorage 获取
    let userInfo = sessionStorage.getItem('feishu_user_info')
    
    // 如果 sessionStorage 中没有，尝试从 localStorage 获取
    if (!userInfo) {
      userInfo = localStorage.getItem('feishu_user_info')
    }
    
    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo)
      // 从用户信息中获取 token，支持多种可能的字段名
      const token = parsedUserInfo.token || parsedUserInfo.access_token || parsedUserInfo.accessToken || null
      console.log('获取到认证token:', token ? '已获取' : '未获取')
      return token
    }
    
    console.log('未找到用户信息，无法获取token')
    return null
  } catch (error) {
    console.error('获取认证token失败:', error)
    return null
  }
}

export const getAuthHeaders = () => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log('请求头已添加Authorization:', `Bearer ${token.substring(0, 10)}...`)
  } else {
    console.log('未找到token，请求头不包含Authorization')
  }
  
  return headers
} 