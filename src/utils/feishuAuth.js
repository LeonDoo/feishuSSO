import { API_BASE_URL, ENV_NAME } from '../config/index.js'

// 飞书认证工具类
export class FeishuAuth {
  constructor() {
    this.lang = window.navigator.language;
    this.apiBaseUrl = API_BASE_URL;
    console.log('当前语言:', this.lang);
    console.log('当前环境:', ENV_NAME);
    console.log('API地址:', this.apiBaseUrl);
  }

  // 检查飞书环境
  checkFeishuEnvironment() {
    if (!window.h5sdk) {
      console.log('invalid h5sdk');
      // alert('请在飞书中打开');
      return false;
    }
    return true;
  }

  // 获取APP ID
  async getAppId() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/get_appid`);
      console.log('responsessss', response)
      const result = await response.json();
      console.log('获取appid成功:', result);
      return result.appid;
    } catch (error) {
      console.error('获取appid失败:', error);
      throw error;
    }
  }

  // 获取用户信息
  async getUserInfo(code) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/getUserInfoBySdkCode?code=${code}`);
      const result = await response.json();
      console.log('获取用户信息成功:', result);
      return result;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  // 飞书免登认证流程
  async sdkAuth() {
    return new Promise((resolve, reject) => {

      // 获取APP ID
      this.getAppId().then(appId => {
        // 错误处理
        window.h5sdk.error(err => {
          console.error('h5sdk error:', JSON.stringify(err));
          reject(err);
        });

        // 环境准备就绪
        window.h5sdk.ready(() => {
          console.log('window.h5sdk.ready');
          console.log('url:', window.location.href);

          // 调用免登接口
          window.tt.requestAccess({
            appID: appId,
            scopeList: [],
            // 成功回调
            success: (res) => {
              console.log('获取授权码成功');
              // 获取用户信息
              this.getUserInfo(res.code).then(userInfo => {
                resolve(userInfo);
              }).catch(error => {
                reject(error);
              });
            },
            // 失败回调
            fail: (err) => {
              console.log('获取授权码失败:', JSON.stringify(err));
              reject(err);
            }
          });
        });
      }).catch(error => {
        reject(error);
      });
    });
  }

  // 处理用户信息显示
  formatUserInfo(userInfo) {
    console.log('formatUserInfo 输入:', userInfo);
    
    if (!userInfo) {
      console.warn('userInfo 为空，返回默认值');
      return {
        name: '未知用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown',
        welcomeText: '欢迎使用',
        rawData: null
      };
    }
    
    const isZhCN = this.lang === "zh_CN" || this.lang === "zh-CN";
    
    // 尝试获取用户名
    let name = '未知用户';
    console.log('检查用户名字段:');
    console.log('- userInfo.name:', userInfo.name);
    console.log('- userInfo.en_name:', userInfo.en_name);
    console.log('- userInfo.user_name:', userInfo.user_name);
    console.log('- userInfo.display_name:', userInfo.display_name);
    
    if (userInfo.name) {
      name = userInfo.name;
      console.log('使用 userInfo.name:', name);
    } else if (userInfo.en_name) {
      name = userInfo.en_name;
      console.log('使用 userInfo.en_name:', name);
    } else if (userInfo.user_name) {
      name = userInfo.user_name;
      console.log('使用 userInfo.user_name:', name);
    } else if (userInfo.display_name) {
      name = userInfo.display_name;
      console.log('使用 userInfo.display_name:', name);
    } else {
      console.warn('未找到有效的用户名字段');
    }
    
    // 尝试获取头像
    let avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown';
    if (userInfo.avatar_url) {
      avatar = userInfo.avatar_url;
    } else if (userInfo.avatar) {
      avatar = userInfo.avatar;
    } else if (userInfo.picture) {
      avatar = userInfo.picture;
    }
    
    const formattedInfo = {
      name: name,
      avatar: avatar,
      welcomeText: isZhCN ? "欢迎使用飞书" : "Welcome to Feishu",
      rawData: userInfo
    };
    
    console.log('formatUserInfo 输出:', formattedInfo);
    return formattedInfo;
  }

  // 从session中获取用户信息
  getSessionUserInfo() {
    try {
      // 尝试从sessionStorage获取用户信息
      const sessionUserInfo = sessionStorage.getItem('feishu_user_info');
      if (sessionUserInfo) {
        const userInfo = JSON.parse(sessionUserInfo);
        console.log('从session获取到用户信息:', userInfo.name);
        return this.formatUserInfo(userInfo);
      }
      
      // 尝试从localStorage获取用户信息（持久化登录）
      const localUserInfo = localStorage.getItem('feishu_user_info');
      if (localUserInfo) {
        const userInfo = JSON.parse(localUserInfo);
        console.log('从localStorage获取到用户信息:', userInfo.name);
        return this.formatUserInfo(userInfo);
      }
      
      return null;
    } catch (error) {
      console.error('获取session用户信息失败:', error);
      return null;
    }
  }

  // 保存用户信息到session
  saveUserInfoToSession(userInfo, persistent = false) {
    try {
      const storage = persistent ? localStorage : sessionStorage;
      storage.setItem('feishu_user_info', JSON.stringify(userInfo));
      console.log('用户信息已保存到', persistent ? 'localStorage' : 'sessionStorage');
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  }

  // 清除用户信息
  clearUserInfo() {
    try {
      sessionStorage.removeItem('feishu_user_info');
      localStorage.removeItem('feishu_user_info');
      console.log('用户信息已清除');
    } catch (error) {
      console.error('清除用户信息失败:', error);
    }
  }

  // 检查登录状态并获取用户信息
  async checkLoginAndGetUser() {
    try {
      // 首先从session中检查是否已经登录
      const sessionUserInfo = this.getSessionUserInfo();
      if (sessionUserInfo) {
        console.log('用户已登录（从session获取）');
        return sessionUserInfo;
      }
      
      const openInFeishu = this.checkFeishuEnvironment();
      // 未登录，执行免登流程
      console.log('用户未登录，开始免登流程');
      const userInfo = openInFeishu ? await this.sdkAuth() : this.apiAuth();
      
      // 检查获取到的用户信息是否有效
      if (!userInfo || !userInfo.name) {
        throw new Error('获取到的用户信息无效');
      }
      
      // 保存用户信息到session
      this.saveUserInfoToSession(userInfo, true); // 持久化保存
      
      return this.formatUserInfo(userInfo);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 不保存任何信息到storage，也不返回默认用户信息
      // 让调用方处理错误状态
      throw error;
    }
  }

  async apiAuth() {
    const appid = await this.getAppId();
    localStorage.setItem('feishu_appid', appid);
    const redirectUri = window.location.origin + window.location.pathname;
    // 构建授权URL
    const state = this.generateRandomString(16);
    localStorage.setItem('feishu_state', state);
    const authUrl = `https://accounts.feishu.cn/open-apis/authen/v1/authorize?` +
                `client_id=${encodeURIComponent(appid)}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `response_type=code&` +
                `state=${encodeURIComponent(state)}`;
    // 跳转到授权页面
    window.location.href = authUrl;
  }

  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async handleAuthorizationCode(code, state) {
    try {
      console.log('开始处理授权码:', code, 'state:', state);
      
      // 验证state参数
      const savedState = localStorage.getItem('feishu_state');
      if (state !== savedState) {
          throw new Error('State参数验证失败，可能存在安全风险');
      }

      // 获取新的用户信息
      const userInfo = await this.getUserInfoByCode(code);
      console.log('从后端获取到的原始用户信息:', userInfo);
      
      // 检查用户信息是否有效
      if (!userInfo) {
        throw new Error('后端返回的用户信息为空');
      }
      
      // 格式化用户信息
      const formattedUserInfo = this.formatUserInfo(userInfo);
      console.log('格式化后的用户信息:', formattedUserInfo);
      
      // 检查格式化后的信息
      if (!formattedUserInfo.name || formattedUserInfo.name === '未知用户') {
        console.warn('格式化后的用户名为空或未知，原始数据:', userInfo);
        console.warn('格式化结果:', formattedUserInfo);
      }
      
      // 保存到session
      this.saveUserInfoToSession(userInfo, true);
      console.log('用户信息已保存到session');
      
      return formattedUserInfo;
    } catch (error) {
      console.error('处理授权码失败:', error);
      throw error;
    }
  }

  // 获取access_token
  async getAccessToken(code, clientId, clientSecret) {
    try {
      const url = 'https://open.feishu.cn/open-apis/authen/v2/oauth/token';
      const requestBody = {
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: code
      };

      console.log('请求access_token URL:', url);
      console.log('请求参数:', requestBody);

      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('access_token响应:', data);

      if (data.code !== 0) {
          throw new Error(data.error_description || data.msg || '获取Token失败');
      }

      return data.data;
    } catch (error) {
      console.error('获取access_token失败:', error);
      throw error;
    }
  }
  // 通过access_token获取用户信息
  async getUserInfoByToken(accessToken) {
    try {
      const url = 'https://open.feishu.cn/open-apis/authen/v1/user_info';
      
      console.log('请求用户信息 URL:', url);
      console.log('使用Token:', accessToken);

      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json; charset=utf-8'
          }
      });

      const data = await response.json();
      console.log('用户信息响应:', data);

      if (data.code !== 0) {
          throw new Error(data.msg || '获取用户信息失败');
      }

      return data.data;
    } catch (error) {
      console.error('通过token获取用户信息失败:', error);
      throw error;
    }
  }

  async getUserInfoByCode(code) {
    try {
      const redirectUri = window.location.origin + window.location.pathname;
      
      const response = await fetch(`${this.apiBaseUrl}/getUserInfoByApiCode?code=${code}&redirectUri=${redirectUri}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('用户信息响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('获取用户信息成功，完整响应:', result);
      
      // 检查响应格式
      if (result.data) {
        console.log('返回result.data:', result.data);
        return result.data;
      } else if (result.name || result.en_name) {
        console.log('返回result本身:', result);
        return result;
      } else {
        console.log('返回完整result:', result);
        return result;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
}

// 创建单例
export const feishuAuth = new FeishuAuth(); 