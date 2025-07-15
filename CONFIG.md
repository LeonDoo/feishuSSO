# 环境配置说明

## 📋 配置概述

项目支持多环境配置，可以根据不同的部署环境自动切换API地址和其他配置。

## 🔧 配置文件

### 主配置文件
- 位置：`src/config/index.js`
- 包含开发、测试、生产三个环境的配置

### 配置项说明

```javascript
{
  API_BASE_URL: '后端API基础地址',
  APP_TITLE: '应用标题',
  ENV_NAME: '环境名称'
}
```

## 🌍 环境配置

### 开发环境 (development)
```javascript
development: {
  API_BASE_URL: 'http://localhost:8080',
  APP_TITLE: 'FFCRM系统 (开发环境)',
  ENV_NAME: 'development'
}
```

### 测试环境 (test)
```javascript
test: {
  API_BASE_URL: 'http://test.your-domain.com',
  APP_TITLE: 'FFCRM系统 (测试环境)',
  ENV_NAME: 'test'
}
```

### 生产环境 (production)
```javascript
production: {
  API_BASE_URL: 'https://your-production-domain.com',
  APP_TITLE: 'FFCRM系统',
  ENV_NAME: 'production'
}
```

## 🎯 环境检测规则

系统按以下优先级自动检测环境：

1. **Vite环境变量**：`import.meta.env.MODE`
2. **域名检测**：
   - `localhost` 或 `127.0.0.1` → 开发环境
   - 包含 `test` 或 `staging` → 测试环境
   - 其他域名 → 生产环境

## 🔀 修改配置

### 修改API地址

1. **开发环境**（本地开发）：
   ```javascript
   development: {
     API_BASE_URL: 'http://localhost:8080', // 修改为您的后端地址
   }
   ```

2. **生产环境**：
   ```javascript
   production: {
     API_BASE_URL: 'https://api.your-domain.com', // 修改为生产环境API地址
   }
   ```

### 修改应用标题

```javascript
development: {
  APP_TITLE: 'FFCRM系统 (开发环境)', // 开发环境标题
}

production: {
  APP_TITLE: '您的应用名称', // 生产环境标题
}
```

## 📝 使用方法

### 在组件中使用配置

```javascript
import { API_BASE_URL, APP_TITLE, ENV_NAME } from '../config/index.js'

// 使用API地址
const response = await fetch(`${API_BASE_URL}/api/users`)

// 使用应用标题
document.title = APP_TITLE

// 判断环境
if (ENV_NAME === 'development') {
  console.log('开发环境')
}
```

### 导入配置工具函数

```javascript
import { isDevelopment, isProduction, isTest } from '../config/index.js'

if (isDevelopment()) {
  // 开发环境特定逻辑
}

if (isProduction()) {
  // 生产环境特定逻辑
}
```

## 🚀 部署配置

### 开发环境
```bash
npm run dev
# 自动使用 development 配置
```

### 生产环境构建
```bash
npm run build
# 根据部署域名自动选择环境
```

### 强制指定环境
可以通过Vite的mode参数强制指定环境：

```bash
# 构建测试环境
npm run build -- --mode test

# 以生产模式运行开发服务器
npm run dev -- --mode production
```

## 🛠️ 环境变量支持

如果需要使用环境变量，可以创建对应的`.env`文件：

### .env.development
```
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=FFCRM系统 (开发环境)
```

### .env.production
```
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_TITLE=FFCRM系统
```

然后在配置文件中使用：
```javascript
development: {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'FFCRM系统 (开发环境)',
}
```

## 🔍 调试配置

### 查看当前配置
打开浏览器控制台，在开发环境下会自动打印当前配置：
```
🔧 当前环境配置: {
  API_BASE_URL: "http://localhost:8080",
  APP_TITLE: "FFCRM系统 (开发环境)",
  ENV_NAME: "development"
}
```

### API测试工具
页面右下角的"🔧 API测试"工具会显示：
- 🌍 当前环境
- 🔗 API地址
- 各接口的连接状态

## ⚠️ 注意事项

1. **生产环境安全**：生产环境的API地址不要包含敏感信息
2. **CORS配置**：确保后端API支持跨域请求
3. **HTTPS要求**：生产环境建议使用HTTPS
4. **配置验证**：部署前务必测试各环境的配置是否正确

## 🔗 相关文件

- `src/config/index.js` - 主配置文件
- `src/utils/feishuAuth.js` - 使用配置的认证工具
- `src/components/APITester.vue` - API测试工具
- `FEISHU_DEPLOYMENT.md` - 部署说明文档 