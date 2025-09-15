# 🚀 Cursor MCP 最终配置指南

## ✅ 服务器状态：完全正常

测试结果显示JavaScript MCP服务器工作完美：
- ✅ 正确响应MCP协议
- ✅ 返回2个完整工具
- ✅ 所有功能正常

## 🔧 推荐配置

### 配置1: 调试脚本（最稳定）

请将您的 `/Users/xiaogaiguo/.cursor/mcp.json` 完全替换为：

```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://apidoc.ksmobile.com",
        "YAPI_TOKEN": "_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjE0MTMsImlhdCI6MTc1NTUwMDQ0OCwiZXhwIjoxNzU2MTA1MjQ4fQ.AN664KfB_8NqMnccD1d3KASW7GlCsAPvkOd71yuRmQQ; _yapi_uid=1413",
        "NODE_ENV": "cli",
        "YAPI_LOG_LEVEL": "info",
        "YAPI_CACHE_TTL": "10"
      }
    },
    "mysql": {
      "command": "/Users/xiaogaiguo/.local/bin/mcp-server-mysql",
      "args": [],
      "env": {
        "MYSQL_HOST": "10.60.82.110",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "root",
        "MYSQL_DATABASE": "swan_web"
      }
    },
    "smart-promptor-mcp": {
      "url": "http://43.138.8.90:8177/sse",
      "description": "SmartPromptor - 智能提示词增强MCP服务"
    },
    "openai-cost-mcp": {
      "command": "/Users/xiaogaiguo/GolandProjects/openAi/api-usage/openai-cost-mcp-js/cursor_test.sh",
      "args": [],
      "env": {}
    }
  }
}
```

### 配置2: 绝对路径（备用）

如果配置1不工作，尝试：

```json
"openai-cost-mcp": {
  "command": "/Users/xiaogaiguo/.nvm/versions/node/v16.9.1/bin/node",
  "args": ["/Users/xiaogaiguo/GolandProjects/openAi/api-usage/openai-cost-mcp-js/index.js"],
  "env": {
    "PATH": "/Users/xiaogaiguo/.nvm/versions/node/v16.9.1/bin:/usr/local/bin:/usr/bin:/bin",
    "NODE_ENV": "production"
  }
}
```

## 🔄 操作步骤

1. **备份现有配置** (可选):
   ```bash
   cp /Users/xiaogaiguo/.cursor/mcp.json /Users/xiaogaiguo/.cursor/mcp.json.backup
   ```

2. **更新配置**: 使用上面的配置1替换整个mcp.json文件

3. **完全重启Cursor**:
   - 按 `⌘+Q` 完全退出Cursor
   - 等待5秒
   - 重新启动Cursor
   - 等待30秒让所有服务器启动

4. **验证状态**:
   - 打开MCP Tools面板
   - 检查openai-cost-mcp状态
   - 应该看到🟢绿灯和"2 tools enabled"

## 🧪 测试查询

如果显示绿灯，立即测试：

```
查询我的OpenAI API在2025年9月5号的消耗情况，我的key是sk-xxxxx
```

## 🔍 故障排除

### 如果还是红灯：

1. **检查Cursor日志**:
   - 按 `⌘+Shift+I` 打开开发者工具
   - 查看Console标签页的错误信息

2. **检查文件权限**:
   ```bash
   ls -la /Users/xiaogaiguo/GolandProjects/openAi/api-usage/openai-cost-mcp-js/cursor_test.sh
   ```

3. **手动测试脚本**:
   ```bash
   /Users/xiaogaiguo/GolandProjects/openAi/api-usage/openai-cost-mcp-js/cursor_test.sh
   ```

4. **检查Cursor版本**: 确保使用最新版本的Cursor

## 🎯 成功标志

配置成功后您应该看到：
- 🟢 openai-cost-mcp 绿灯状态
- 📱 "2 tools enabled" 显示
- 🧪 可以成功查询OpenAI成本

---

**服务器已经完全准备好，只需要正确的Cursor配置！** 🚀
