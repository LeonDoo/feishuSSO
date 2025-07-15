# 飞书JSSDK集成部署说明

## 📋 概述

本项目已集成飞书H5 JSSDK，支持免登认证和用户信息获取。项目包含开发环境的Mock服务和生产环境的真实飞书接口调用。

## 🔧 开发环境

### 当前状态
- ✅ 已集成飞书JSSDK (1.5.26版本)
- ✅ 已添加VConsole调试工具  
- ✅ 接口地址已配置为 http://localhost:8080
- ✅ 已实现响应式用户界面

### 开发环境特性
- 自动检测飞书SDK是否可用
- 直接调用后端接口获取用户信息
- 支持热重载和实时调试
- VConsole提供移动端调试支持

## 🚀 生产环境部署

### 1. 后端接口要求

需要在 **http://localhost:8080/api/feishu/app** 实现以下接口：

#### GET http://localhost:8080/api/feishu/app/get_appid
返回飞书应用的APP ID
```json
{
  "appid": "your_feishu_app_id"
}
```

#### GET http://localhost:8080/api/feishu/app/callback?code={authorization_code}
处理飞书授权回调，返回用户信息
```json
{
  "name": "用户姓名",
  "en_name": "User Name",
  "avatar_url": "头像URL",
  "user_id": "用户ID",
  "email": "用户邮箱"
}
```

### 2. 前端Session管理

用户登录状态现在通过前端Session管理：

- **sessionStorage**: 会话期间保存用户信息（关闭浏览器后清除）
- **localStorage**: 持久化保存用户信息（关闭浏览器后保留）
- **自动检测**: 优先从sessionStorage获取，其次从localStorage获取
- **登出功能**: 清除所有存储的用户信息

### 2. 飞书应用配置

在飞书开放平台配置：
1. 创建企业自建应用
2. 配置网页应用域名
3. 设置回调URL
4. 获取App ID和App Secret

### 3. 部署步骤

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署静态文件**
   将`dist`目录部署到Web服务器

3. **配置后端服务**
   实现上述三个接口，处理飞书认证逻辑

4. **配置域名**
   确保域名已在飞书开放平台中配置

### 4. 环境变量配置

在生产环境中可以通过环境变量控制：
```javascript
// 在vite.config.js中配置
export default {
  define: {
    __USE_MOCK__: JSON.stringify(false) // 生产环境关闭Mock
  }
}
```

## 🧪 测试方法

### 开发环境测试
1. 启动后端服务器：在 http://localhost:8080/api/feishu/app 实现必需接口
2. 启动前端开发服务器：`npm run dev`
3. 打开 http://localhost:5173
4. 查看VConsole中的日志
5. 观察用户信息加载过程
6. 测试登出功能（点击用户名旁的🚪按钮）

### 飞书环境测试
1. 确保后端接口正常运行
2. 将应用部署到测试环境
3. 在飞书中打开应用链接
4. 验证免登流程
5. 检查用户信息显示

## 🔍 故障排查

### 常见问题

1. **SDK加载失败**
   - 检查网络连接
   - 确认飞书环境
   - 查看控制台错误

2. **接口调用失败**
   - 检查后端接口是否正常
   - 验证跨域配置
   - 查看网络请求日志

3. **用户信息获取失败**
   - 确认App ID配置正确
   - 检查授权范围设置
   - 验证回调接口逻辑

### 调试工具
- VConsole：移动端调试
- 浏览器开发者工具
- 飞书开发者工具

## 📝 代码结构

```
src/
├── utils/
│   └── feishuAuth.js      # 飞书认证逻辑
├── components/
│   ├── Home.vue           # 首页组件
│   └── ResponsiveTest.vue # 响应式测试工具
└── App.vue                # 主应用组件
```

## 🔗 相关链接

- [飞书开放平台](https://open.feishu.cn/)
- [飞书H5 JSSDK文档](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/h5_jsapi/overview)
- [VConsole文档](https://github.com/Tencent/vConsole)

## 📞 技术支持

如有问题，请检查：
1. 飞书开放平台配置
2. 后端接口实现
3. 网络连接状态
4. 浏览器控制台日志 