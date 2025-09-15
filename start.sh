#!/bin/bash

# OpenAI Cost MCP 启动脚本
# 确保使用正确的Node.js路径

export PATH="/Users/xiaogaiguo/.nvm/versions/node/v16.9.1/bin:$PATH"
export NODE_ENV=production

cd "$(dirname "$0")"
exec node index.js
