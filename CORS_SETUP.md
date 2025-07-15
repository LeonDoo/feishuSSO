# CORS 跨域配置说明

## 🚨 问题描述

前端应用运行在 `http://localhost:5173`，后端服务运行在 `http://localhost:8080`，由于浏览器的同源策略，需要配置CORS才能正常通信。

## 🔧 后端CORS配置

### Spring Boot 配置示例

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173") // 前端地址
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 或者使用注解方式

```java
@RestController
@RequestMapping("/api/feishu/app")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FeishuController {
    
    @GetMapping("/get_appid")
    public Map<String, String> getAppId() {
        // 你的逻辑
    }
    
    @GetMapping("/callback")
    public UserInfo callback(@RequestParam String code) {
        // 你的逻辑
    }
}
```

### Node.js Express 配置示例

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// CORS配置
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/api/feishu/app/get_appid', (req, res) => {
    res.json({ appid: 'your_app_id' });
});

app.get('/api/feishu/app/callback', (req, res) => {
    // 处理回调逻辑
});
```

### Python Flask 配置示例

```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'], supports_credentials=True)

@app.route('/api/feishu/app/get_appid')
def get_appid():
    return jsonify({'appid': 'your_app_id'})

@app.route('/api/feishu/app/callback')
def callback():
    # 处理回调逻辑
    pass
```

## 📋 必需的CORS响应头

后端需要返回以下响应头：

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
Access-Control-Allow-Credentials: true
```

## 🔍 测试CORS配置

### 使用curl测试

```bash
# 测试预检请求
curl -X OPTIONS http://localhost:8080/api/feishu/app/get_appid \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# 测试实际请求
curl -X GET http://localhost:8080/api/feishu/app/get_appid \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -v
```

### 浏览器开发者工具

1. 打开浏览器开发者工具 (F12)
2. 切换到 Network 标签
3. 刷新页面或触发API请求
4. 查看请求是否成功，检查响应头

## 🛠️ 前端调试信息

前端现在会输出详细的调试信息：

```javascript
// 控制台会显示：
正在请求App ID: http://localhost:8080/api/feishu/app/get_appid
响应状态: 200 OK
响应头: {content-type: "application/json", ...}
```

如果出现跨域错误，会显示：

```
可能是跨域问题，请确保后端已配置CORS
后端需要添加以下CORS头:
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true
```

## 🚀 生产环境配置

生产环境需要将 `http://localhost:5173` 替换为实际的前端域名：

```java
// 开发环境
.allowedOrigins("http://localhost:5173")

// 生产环境
.allowedOrigins("https://your-frontend-domain.com")
```

## ⚠️ 常见问题

### 1. 预检请求失败
- 确保后端支持 OPTIONS 请求
- 检查 Access-Control-Allow-Methods 头

### 2. 凭证问题
- 前端设置了 `credentials: 'include'`
- 后端必须设置 `Access-Control-Allow-Credentials: true`
- 不能使用通配符 `*` 作为 Origin

### 3. 请求头问题
- 确保 Access-Control-Allow-Headers 包含所需的头
- 常见的有：Content-Type, Authorization, Accept

## 📞 故障排查步骤

1. **检查后端日志**：查看是否有CORS相关的错误
2. **检查浏览器控制台**：查看网络请求的详细信息
3. **使用curl测试**：验证后端接口是否正常
4. **检查响应头**：确认CORS头是否正确设置

## 🔗 相关资源

- [MDN CORS文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Spring Boot CORS配置](https://spring.io/guides/gs/rest-service-cors/)
- [Express CORS中间件](https://expressjs.com/en/resources/middleware/cors.html) 