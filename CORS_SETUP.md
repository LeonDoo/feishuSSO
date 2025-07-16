# CORS 跨域配置指南

## 问题描述
前端应用在请求后端 API 时遇到跨域（CORS）问题，需要在后端正确配置 CORS 策略。

## 前端请求配置
前端已经配置了以下请求参数：
- `mode: 'cors'` - 启用跨域请求
- `Content-Type: 'application/json'` - JSON 内容类型
- `Accept: 'application/json'` - 接受 JSON 响应

## 后端 CORS 配置

### Spring Boot (Java)
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")  // 或者指定具体域名
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)  // 前端没有使用 credentials
                .maxAge(3600);
    }
}
```

或者使用注解方式：
```java
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
public class ApiController {
    // 控制器方法
}
```

### Express.js (Node.js)
```javascript
const cors = require('cors');

app.use(cors({
    origin: '*',  // 或者指定具体域名
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: false
}));
```

### Flask (Python)
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept", "Authorization"]
    }
})
```

## 关键配置点

### 1. 允许的源（Origin）
```javascript
// 开发环境
origin: ['http://localhost:5173', 'http://127.0.0.1:5173']

// 生产环境
origin: ['https://yourdomain.com']
```

### 2. 允许的方法
```javascript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
```

### 3. 允许的请求头
```javascript
allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
```

### 4. 预检请求缓存时间
```javascript
maxAge: 3600  // 1小时
```

## 调试步骤

### 1. 检查浏览器控制台
- 打开浏览器开发者工具
- 查看 Network 标签页
- 检查请求是否发送成功
- 查看响应状态码和响应头

### 2. 检查后端日志
- 查看后端服务器日志
- 确认请求是否到达后端
- 检查 CORS 配置是否正确

### 3. 测试 CORS 配置
```bash
# 使用 curl 测试预检请求
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:8080/get_appid
```

## 常见错误及解决方案

### 1. Access-Control-Allow-Origin 错误
**错误信息**: `Access to fetch at 'http://localhost:8080/get_appid' from origin 'http://localhost:5173' has been blocked by CORS policy`

**解决方案**: 确保后端配置了正确的 `Access-Control-Allow-Origin` 头

### 2. 预检请求失败
**错误信息**: `Request header field Content-Type is not allowed by Access-Control-Allow-Headers`

**解决方案**: 在 CORS 配置中添加 `Content-Type` 到允许的请求头

### 3. 方法不允许
**错误信息**: `Method GET is not allowed by Access-Control-Allow-Methods`

**解决方案**: 确保 `GET` 方法在允许的方法列表中

## 安全建议

1. **生产环境不要使用 `*`**：指定具体的域名而不是通配符
2. **限制允许的方法**：只允许必要的 HTTP 方法
3. **限制允许的请求头**：只允许必要的请求头
4. **设置合理的缓存时间**：避免过长的预检请求缓存

## 测试接口

确保以下接口可以正常访问：
- `GET /get_appid` - 获取应用ID
- `GET /get_app_secret` - 获取应用密钥
- `GET /callback?code={code}` - 处理授权回调

## 前端调试信息

前端会在控制台输出详细的请求信息：
- 请求 URL
- 响应状态码
- 响应头信息
- 错误详情

请根据这些信息来调试和修复 CORS 问题。 