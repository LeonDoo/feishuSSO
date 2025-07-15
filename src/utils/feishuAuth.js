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
      alert('请在飞书中打开');
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
      console.log('获取appid成功:', result.appid);
      return result.appid;
    } catch (error) {
      console.error('获取appid失败:', error);
      throw error;
    }
  }

  // 获取用户信息
  async getUserInfo(code) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/callback?code=${code}`);
      const result = await response.json();
      console.log('获取用户信息成功');
      return result;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  // 飞书免登认证流程
  async apiAuth() {
    return new Promise((resolve, reject) => {
      if (!this.checkFeishuEnvironment()) {
        reject(new Error('飞书环境检查失败'));
        return;
      }

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
    const isZhCN = this.lang === "zh_CN" || this.lang === "zh-CN";
    
    return {
      name: isZhCN ? userInfo.name : userInfo.en_name,
      avatar: userInfo.avatar_url,
      welcomeText: isZhCN ? "欢迎使用飞书" : "Welcome to Feishu",
      rawData: userInfo
    };
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
      
      // 未登录，执行免登流程
      console.log('用户未登录，开始免登流程');
      const userInfo = await this.apiAuth();
      
      // 保存用户信息到session
      this.saveUserInfoToSession(userInfo, true); // 持久化保存
      
      return this.formatUserInfo(userInfo);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 返回默认用户信息
      return {
        name: '游客用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
        welcomeText: '请启动后端服务',
        rawData: null
      };
    }
  }
}

// 创建单例
export const feishuAuth = new FeishuAuth(); 