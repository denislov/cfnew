# Cloudflare Worker Headless API - 使用文档

## 版本说明

**版本**: 3.0 - Headless API
**更新日期**: 2026-01-18

本版本已完成从UI版本到纯API后端的重构：
- ✅ 移除所有HTML/UI界面
- ✅ 添加全量CORS支持
- ✅ 根路径支持状态信息和博客反向代理
- ✅ 保留所有核心代理功能

---

## 主要特性

### 核心功能
- **多协议支持**: VLESS、Trojan、xhttp
- **WebSocket代理**: 完整的WebSocket/TCP/UDP转发
- **SOCKS5支持**: 可选的SOCKS5代理
- **ECH加密**: 支持Encrypted Client Hello
- **智能地区匹配**: 自动选择最优代理IP
- **订阅生成**: 支持多种客户端配置格式

### API功能
- **配置管理API**: 通过KV存储管理配置
- **优选IP管理**: 动态管理优选IP列表
- **地区检测**: 自动检测Worker部署地区
- **CORS支持**: 所有API响应支持跨域请求

---

## 快速开始

### 1. 部署到Cloudflare Workers

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers & Pages
3. 创建新的 Worker
4. 复制 `worker.js` 的内容到编辑器
5. 点击 "Save and Deploy"

### 2. 配置环境变量

在Worker设置中添加以下环境变量：

#### 必需变量
- `u` 或 `U`: UUID（用于认证）
  ```
  示例: 351c9981-04b6-4103-aa4b-864aa9c91469
  ```

#### 可选变量
- `d` 或 `D`: 自定义路径（代替UUID）
  ```
  示例: mypath
  ```

- `blogUrl` 或 `BLOGURL`: 博客URL（用于根路径反向代理）
  ```
  示例: https://your-blog.com
  ```

- `p` 或 `P`: ProxyIP地址
- `s` 或 `S`: SOCKS5配置
- `yx` 或 `YX`: 自定义优选IP列表

#### 功能开关
- `ev`: 启用VLESS (默认: yes)
- `et`: 启用Trojan (默认: no)
- `ex`: 启用xhttp (默认: no)
- `ech`: 启用ECH (默认: no)
- `dkby`: 仅TLS模式 (默认: no)
- `rm`: 地区匹配 (默认: yes)

### 3. 配置KV存储（可选）

如果需要使用配置管理API：

1. 创建 KV Namespace
2. 将其绑定到Worker，变量名为 `C`
3. 在代码中会自动初始化

---

## API端点说明

### 根路径 `/`

**功能**: 返回状态信息或反向代理博客

#### 场景1: 未配置博客URL
```bash
curl https://your-worker.workers.dev/
```

**响应**:
```json
{
  "status": "ok",
  "message": "Cloudflare Worker Headless API",
  "version": "3.0",
  "region": "SG",
  "features": {
    "vless": true,
    "trojan": false,
    "xhttp": false,
    "ech": false
  },
  "endpoints": {
    "config": "/api/config (需要UUID或自定义路径前缀)",
    "preferredIPs": "/api/preferred-ips (需要UUID或自定义路径前缀)",
    "subscription": "/{UUID}/sub 或 /{自定义路径}/sub",
    "region": "/{UUID}/region 或 /{自定义路径}/region",
    "testAPI": "/{UUID}/test-api 或 /{自定义路径}/test-api"
  },
  "timestamp": "2026-01-18T10:00:00.000Z"
}
```

#### 场景2: 已配置博客URL
当设置了 `blogUrl` 环境变量后，根路径会反向代理到您的博客网站。

---

### UUID/路径信息 `/{UUID}` 或 `/{自定义路径}`

**功能**: 返回该路径下的API端点信息

```bash
curl https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469
```

**响应**:
```json
{
  "message": "Cloudflare Worker API",
  "uuid": "351c9981-04b6-4103-aa4b-864aa9c91469",
  "endpoints": {
    "subscription": "https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/sub",
    "config": "https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/api/config",
    "preferredIPs": "https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/api/preferred-ips",
    "region": "https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/region",
    "testAPI": "https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/test-api"
  },
  "timestamp": "2026-01-18T10:00:00.000Z"
}
```

---

### 地区检测 `/{UUID}/region`

**功能**: 检测Worker部署的地区

```bash
curl https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/region
```

**响应**:
```json
{
  "region": "SG",
  "detectionMethod": "API检测",
  "timestamp": "2026-01-18T10:00:00.000Z"
}
```

---

### API测试 `/{UUID}/test-api`

**功能**: 测试API是否正常工作

```bash
curl https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/test-api
```

**响应**:
```json
{
  "detectedRegion": "SG",
  "message": "API测试完成",
  "timestamp": "2026-01-18T10:00:00.000Z"
}
```

---

### 订阅链接 `/{UUID}/sub`

**功能**: 生成V2Ray/Clash等客户端的订阅链接

```bash
curl https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/sub
```

**URL参数**:
- `sub`: 订阅转换器URL
- `format`: 订阅格式 (clash, surge, quantumult, shadowrocket, v2ray, loon)

**示例**:
```bash
# Clash订阅
curl "https://your-worker.workers.dev/UUID/sub?format=clash"

# V2Ray订阅
curl "https://your-worker.workers.dev/UUID/sub?format=v2ray"
```

---

### 配置管理 `/{UUID}/api/config`

**功能**: 管理Worker配置（需要KV存储）

#### GET - 获取配置
```bash
curl https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/api/config
```

**响应**:
```json
{
  "p": "1.2.3.4",
  "yx": "8.8.8.8:443#Google DNS",
  "kvEnabled": true
}
```

#### POST - 更新配置
```bash
curl -X POST https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "p": "1.2.3.4",
    "yx": "8.8.8.8:443#Google DNS",
    "blogUrl": "https://my-blog.com"
  }'
```

**响应**:
```json
{
  "success": true,
  "message": "配置已保存",
  "config": {
    "p": "1.2.3.4",
    "yx": "8.8.8.8:443#Google DNS",
    "blogUrl": "https://my-blog.com"
  }
}
```

---

### 优选IP管理 `/{UUID}/api/preferred-ips`

**功能**: 管理优选IP列表（需要KV存储且启用API管理）

#### 前置条件
1. 必须配置KV存储
2. 必须在配置中设置 `ae: "yes"` 启用API管理

#### GET - 获取优选IP列表
```bash
curl https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/api/preferred-ips
```

**响应**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "ip": "1.1.1.1",
      "port": 443,
      "name": "Cloudflare DNS"
    },
    {
      "ip": "8.8.8.8",
      "port": 443,
      "name": "Google DNS"
    }
  ]
}
```

#### POST - 添加优选IP
```bash
curl -X POST https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/api/preferred-ips \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "1.1.1.1",
    "port": 443,
    "name": "Cloudflare DNS"
  }'
```

**批量添加**:
```bash
curl -X POST https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/api/preferred-ips \
  -H "Content-Type: application/json" \
  -d '[
    {"ip": "1.1.1.1", "port": 443, "name": "Cloudflare"},
    {"ip": "8.8.8.8", "port": 443, "name": "Google"}
  ]'
```

**响应**:
```json
{
  "success": true,
  "message": "成功添加 2 个IP",
  "added": 2,
  "skipped": 0,
  "errors": 0,
  "data": {
    "addedIPs": [
      {"ip": "1.1.1.1", "port": 443, "name": "Cloudflare"},
      {"ip": "8.8.8.8", "port": 443, "name": "Google"}
    ]
  }
}
```

#### DELETE - 删除优选IP
```bash
# 删除单个IP
curl -X DELETE https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/api/preferred-ips \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "1.1.1.1",
    "port": 443
  }'

# 清空所有IP
curl -X DELETE https://your-worker.workers.dev/351c9981-04b6-4103-aa4b-864aa9c91469/api/preferred-ips \
  -H "Content-Type: application/json" \
  -d '{"all": true}'
```

---

## CORS支持

所有API响应都包含以下CORS头部：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

这意味着您可以从任何域名的前端应用调用这些API。

---

## 博客反向代理配置

### 通过环境变量配置
在Cloudflare Workers设置中添加：
```
blogUrl = https://your-blog.com
```

### 通过API配置
```bash
curl -X POST https://your-worker.workers.dev/UUID/api/config \
  -H "Content-Type: application/json" \
  -d '{"blogUrl": "https://your-blog.com"}'
```

配置后，访问根路径 `/` 将会代理到您的博客网站。

---

## 代理功能使用

### VLESS客户端配置

从订阅链接获取配置：
```
https://your-worker.workers.dev/UUID/sub?format=v2ray
```

或手动配置：
- **服务器**: your-worker.workers.dev
- **端口**: 443
- **UUID**: 您的UUID
- **传输**: WebSocket
- **TLS**: 启用

### Clash客户端配置

```
https://your-worker.workers.dev/UUID/sub?format=clash
```

---

## 错误处理

所有错误响应都是JSON格式：

```json
{
  "error": "错误类型",
  "message": "详细错误信息",
  "timestamp": "2026-01-18T10:00:00.000Z"
}
```

常见错误代码：
- `400`: 请求参数错误
- `403`: 访问被拒绝（UUID验证失败）
- `404`: 端点不存在
- `405`: 不支持的HTTP方法
- `500`: 服务器内部错误
- `503`: 服务不可用（如KV存储未配置）

---

## 安全建议

1. **保护您的UUID**: 不要公开分享您的UUID
2. **使用自定义路径**: 设置 `d` 变量使用自定义路径代替UUID
3. **启用API管理保护**: 默认情况下优选IP API需要手动启用
4. **定期更新UUID**: 如果怀疑泄露，立即更换UUID
5. **使用KV存储**: 启用KV存储以支持配置持久化

---

## 文件说明

- `worker.js` - 纯API版本Worker代码（本文档对应版本）
- `明文源吗` - 原始UI版本代码
- `明文源吗.backup` - 原始代码备份
- `IMPLEMENTATION_PLAN.md` - 重构实施计划
- `worker_core.txt` - 代码分析报告
- `README_API.md` - 本文档

---

## 更新日志

### v3.0 (2026-01-18)
- ✅ 移除所有HTML/UI界面
- ✅ 添加完整CORS支持
- ✅ 实现根路径状态信息和博客反向代理
- ✅ 优化API响应格式
- ✅ 保留所有核心代理功能
- ✅ 统一错误处理格式

---

## 技术支持

如有问题，请检查：
1. UUID是否正确配置
2. KV存储是否正确绑定（如果使用配置API）
3. 环境变量是否正确设置
4. 查看Worker日志获取详细错误信息

---

## 许可证

本项目基于原始项目修改，保留原有许可证条款。
