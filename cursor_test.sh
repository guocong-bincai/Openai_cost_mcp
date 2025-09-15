#!/bin/bash

# 调试Cursor MCP配置的测试脚本

echo "=== OpenAI Cost MCP 调试测试 ===" >&2
echo "时间: $(date)" >&2
echo "工作目录: $(pwd)" >&2
echo "用户: $(whoami)" >&2
echo "Node版本: $(node --version)" >&2
echo "文件权限: $(ls -la index.js)" >&2

# 设置环境
export PATH="/Users/xiaogaiguo/.nvm/versions/node/v16.9.1/bin:$PATH"
export NODE_ENV=production

# 确保在正确目录
cd "/Users/xiaogaiguo/GolandProjects/openAi/api-usage/openai-cost-mcp-js"

echo "开始启动MCP服务器..." >&2

# 启动服务器
exec node index.js
