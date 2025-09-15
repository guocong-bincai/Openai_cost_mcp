# OpenAI Cost MCP

🚀 **OpenAI API成本查询和分析的MCP服务器** - JavaScript版本

[![npm version](https://badge.fury.io/js/openai-cost-mcp.svg)](https://badge.fury.io/js/openai-cost-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

- 📊 **精确成本计算**: 基于官方OpenAI Usage API获取真实数据
- 🤖 **全模型支持**: GPT-3.5/4、GPT-4o、GPT-5、Whisper、Text-Embedding等
- ⏰ **时间维度分析**: 支持多种日期格式和时间粒度
- 🎯 **智能日期解析**: 支持YYYY-MM-DD、MM-DD等多种格式
- 🔒 **安全可靠**: API Key仅在内存中临时使用，绝不存储、记录或传输到第三方
- 🛡️ **隐私保护**: 所有通信直接连接OpenAI官方API，本地处理，零泄露风险
- 💬 **Cursor集成**: 完美集成Cursor MCP协议

## 🔐 安全保证

我们对用户隐私和API密钥安全做出以下**严格承诺**：

### ✅ **绝不存储API密钥**
- API密钥仅在内存中临时保存，用于单次查询
- 程序结束后自动清除，不留任何痕迹
- 无任何持久化存储（数据库、文件、缓存等）

### ✅ **绝不记录敏感信息**
- 不记录API密钥到任何日志文件
- 不输出密钥到控制台或错误信息中
- 错误日志只包含安全的调试信息

### ✅ **直连OpenAI官方API**
- 所有API调用直接发送到`api.openai.com`
- 不经过任何中间服务器或代理
- 通信使用HTTPS加密传输

### ✅ **本地处理，零传输**
- 所有数据分析在本地内存中完成
- 不向任何第三方服务器发送用户数据
- 完全离线处理，保护隐私

### ✅ **开源透明**
- 完整源代码公开在GitHub
- 所有安全措施可被审计和验证
- 欢迎安全专家审查代码

## 🛠️ 安装

### NPM 安装（推荐）

```bash
npm install -g openai-cost-mcp
```

### 本地安装

```bash
git clone https://github.com/openai-cost-mcp/openai-cost-mcp.git
cd openai-cost-mcp
npm install
```

## 📖 配置使用

### Cursor MCP 配置

在Cursor的MCP设置中添加：

```json
{
  "mcpServers": {
    "openai-cost-mcp": {
      "command": "npx",
      "args": ["-y", "openai-cost-mcp"]
    }
  }
}
```

### 本地开发配置

```json
{
  "mcpServers": {
    "openai-cost-mcp": {
      "command": "node",
      "args": ["/path/to/openai-cost-mcp/index.js"]
    }
  }
}
```

## 🧪 使用示例

配置完成后，在Cursor中可以使用以下查询：

### 基础成本查询
```
查询我的OpenAI API在2025年9月5号的消耗情况，我的key是YOUR_API_KEY_HERE
```

### 模型定价查询
```
获取OpenAI各模型的定价信息
```

### 特定模型查询
```
查看GPT-4o模型的定价
```

## 📊 支持的模型

### GPT-3.5 系列
- GPT-3.5 Turbo: $0.0015/1K (input), $0.002/1K (output)
- GPT-3.5 Turbo 16K: $0.003/1K (input), $0.004/1K (output)

### GPT-4 系列
- GPT-4: $0.03/1K (input), $0.06/1K (output)
- GPT-4 32K: $0.06/1K (input), $0.12/1K (output)

### GPT-4o 系列 (🆕 2025年最新)
- GPT-4o: $0.0025/1K (input), $0.01/1K (output)
- GPT-4o Mini: $0.00015/1K (input), $0.0006/1K (output)

### GPT-5 系列 (🚀 预览版)
- GPT-5 Chat Latest: $0.00125/1K (input), $0.01/1K (output)

### 其他模型
- Text-Embedding-Ada-002: $0.0001/1K (input)
- Whisper: $0.0001/second

## 🔧 开发

### 本地测试

```bash
npm test
```

### 手动测试

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node index.js
```

## 📋 可用工具

### `query_openai_cost`
查询指定日期的OpenAI API使用情况和成本分析

**参数**:
- `api_key` (string, 必需): OpenAI API密钥
- `date` (string, 必需): 查询日期
- `granularity` (integer, 可选): 时间粒度，默认60分钟

### `get_model_pricing`
获取OpenAI各模型的定价信息

**参数**:
- `model` (string, 可选): 指定模型名称

## 🔒 安全性

- ✅ 完全本地运行，API Key仅用于查询
- ✅ 不存储任何敏感信息
- ✅ 仅与OpenAI官方API通信
- ✅ 开源代码，完全透明

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**享受精确的OpenAI成本分析体验！** 🎉
