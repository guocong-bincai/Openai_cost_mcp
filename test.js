#!/usr/bin/env node

/**
 * OpenAI Cost MCP Server 测试文件
 */

const { spawn } = require('child_process');
const path = require('path');

function testMCPServer() {
  console.log('🧪 测试 OpenAI Cost MCP 服务器 (JavaScript版)...');
  
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, 'index.js');
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseReceived = false;
    let responseData = '';

    // 监听服务器输出
    server.stdout.on('data', (data) => {
      responseData += data.toString();
      
      try {
        const lines = responseData.split('\n').filter(line => line.trim());
        const lastLine = lines[lines.length - 1];
        if (lastLine) {
          const response = JSON.parse(lastLine);
          if (response.serverInfo) {
            console.log('✅ 初始化成功!');
            console.log(`服务器: ${response.serverInfo.name} v${response.serverInfo.version}`);
            responseReceived = true;
            
            // 测试工具列表
            testToolsList(server);
          }
        }
      } catch (error) {
        // 忽略JSON解析错误，继续等待
      }
    });

    // 监听错误输出
    server.stderr.on('data', (data) => {
      console.log(`📋 服务器日志: ${data.toString().trim()}`);
    });

    // 监听服务器关闭
    server.on('close', (code) => {
      if (responseReceived) {
        console.log('✅ 测试完成!');
        resolve(true);
      } else {
        console.log(`❌ 服务器异常退出，代码: ${code}`);
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // 发送初始化请求
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };

    console.log('📤 发送初始化请求...');
    server.stdin.write(JSON.stringify(initRequest) + '\n');

    // 超时处理
    setTimeout(() => {
      if (!responseReceived) {
        console.log('❌ 测试超时');
        server.kill();
        reject(new Error('Test timeout'));
      }
    }, 5000);
  });
}

function testToolsList(server) {
  const toolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };

  console.log('📤 请求工具列表...');
  server.stdin.write(JSON.stringify(toolsRequest) + '\n');

  // 监听工具列表响应
  const originalListener = server.stdout.listeners('data')[0];
  server.stdout.removeListener('data', originalListener);

  server.stdout.on('data', (data) => {
    try {
      const lines = data.toString().split('\n').filter(line => line.trim());
      for (const line of lines) {
        const response = JSON.parse(line);
        if (response.tools) {
          console.log(`✅ 发现 ${response.tools.length} 个工具:`);
          response.tools.forEach(tool => {
            console.log(`  • ${tool.name}: ${tool.description}`);
          });
          
          setTimeout(() => {
            server.kill();
          }, 1000);
          break;
        }
      }
    } catch (error) {
      // 忽略JSON解析错误
    }
  });
}

async function main() {
  console.log('🛠️  OpenAI Cost MCP 测试工具 (JavaScript版)');
  console.log('=' * 60);

  try {
    await testMCPServer();
    
    console.log('\n🎉 所有测试通过!');
    console.log('\n📝 Cursor配置:');
    console.log(JSON.stringify({
      "openai-cost-mcp": {
        "command": "npx",
        "args": ["-y", "openai-cost-mcp"]
      }
    }, null, 2));
    
    console.log('\n🚀 发布到npm:');
    console.log('npm publish');
    
  } catch (error) {
    console.error(`\n❌ 测试失败: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
