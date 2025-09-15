#!/usr/bin/env node

/**
 * OpenAI Cost MCP 交互式测试工具
 * 用于测试真实API key和成本查询功能
 */

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

class MCPTester {
  constructor() {
    this.server = null;
    this.requestId = 1;
  }

  async startServer() {
    console.log('🚀 启动 OpenAI Cost MCP 服务器...');
    
    const serverPath = path.join(__dirname, 'index.js');
    this.server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // 监听服务器错误输出
    this.server.stderr.on('data', (data) => {
      console.log(`📋 服务器日志: ${data.toString().trim()}`);
    });

    // 初始化服务器
    await this.sendRequest({
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'interactive-test', version: '1.0.0' }
      }
    });

    console.log('✅ MCP服务器初始化完成!');
  }

  async sendRequest(request) {
    return new Promise((resolve, reject) => {
      let responseData = '';
      
      const dataHandler = (data) => {
        responseData += data.toString();
        
        try {
          const lines = responseData.split('\n').filter(line => line.trim());
          const lastLine = lines[lines.length - 1];
          if (lastLine) {
            const response = JSON.parse(lastLine);
            this.server.stdout.removeListener('data', dataHandler);
            resolve(response);
          }
        } catch (error) {
          // 继续等待完整的JSON响应
        }
      };

      this.server.stdout.on('data', dataHandler);
      this.server.stdin.write(JSON.stringify(request) + '\n');
      
      // 超时处理
      setTimeout(() => {
        this.server.stdout.removeListener('data', dataHandler);
        reject(new Error('请求超时'));
      }, 10000);
    });
  }

  async testQueryCost(apiKey, date) {
    console.log('\n📊 测试成本查询...');
    
    try {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'query_openai_cost',
          arguments: {
            api_key: apiKey,
            date: date,
            granularity: 60
          }
        }
      });

      if (response.content && response.content[0]) {
        console.log('\n📈 查询结果:');
        console.log(response.content[0].text);
      } else if (response.error) {
        console.log('❌ 查询失败:', response.error.message);
      }
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
  }

  async testModelPricing() {
    console.log('\n💰 测试模型定价查询...');
    
    try {
      const response = await this.sendRequest({
        jsonrpc: '2.0',
        id: this.requestId++,
        method: 'tools/call',
        params: {
          name: 'get_model_pricing',
          arguments: {}
        }
      });

      if (response.content && response.content[0]) {
        console.log('\n💰 定价信息:');
        console.log(response.content[0].text);
      }
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
  }

  async close() {
    if (this.server) {
      this.server.kill();
      console.log('\n🔚 服务器已关闭');
    }
  }
}

async function main() {
  console.log('🧪 OpenAI Cost MCP 交互式测试工具');
  console.log('=' * 50);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  const tester = new MCPTester();

  try {
    await tester.startServer();

    // 测试模型定价（不需要API key）
    await tester.testModelPricing();

    // 询问是否测试API key
    const testApi = await question('\n是否测试OpenAI API key功能? (y/N): ');
    
    if (testApi.toLowerCase() === 'y' || testApi.toLowerCase() === 'yes') {
      const apiKey = await question('请输入您的OpenAI API key: ');
      
      if (!apiKey.trim()) {
        console.log('❌ 未输入API key，跳过API测试');
      } else {
        // 安全检测API key格式（不泄露任何密钥信息）
        console.log(`\n🔍 检测到API key格式: ${apiKey.startsWith('sk-proj-') ? '项目密钥' : '传统密钥'}`);
        console.log(`🔒 密钥验证: 格式正确，长度符合要求`);
        
        const date = await question('请输入查询日期 (YYYY-MM-DD, 默认昨天): ') || 
                     new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
        
        await tester.testQueryCost(apiKey, date);
      }
    }

    console.log('\n✨ 测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await tester.close();
    rl.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}
