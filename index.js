#!/usr/bin/env node

/**
 * OpenAI Cost MCP Server - JavaScript版本
 * 完全兼容Cursor MCP协议的OpenAI API成本分析服务
 */

const axios = require('axios');
const readline = require('readline');

// 模型成本配置 (USD per 1K tokens)
const MODEL_COSTS = {
  // GPT-3.5 系列
  'gpt-3.5-turbo-0301': { context: 0.0015, generated: 0.002 },
  'gpt-3.5-turbo-0613': { context: 0.0015, generated: 0.002 },
  'gpt-3.5-turbo-16k': { context: 0.003, generated: 0.004 },
  'gpt-3.5-turbo-16k-0613': { context: 0.003, generated: 0.004 },
  
  // GPT-4 系列
  'gpt-4-0314': { context: 0.03, generated: 0.06 },
  'gpt-4-0613': { context: 0.03, generated: 0.06 },
  'gpt-4-32k': { context: 0.06, generated: 0.12 },
  'gpt-4-32k-0314': { context: 0.06, generated: 0.12 },
  'gpt-4-32k-0613': { context: 0.06, generated: 0.12 },
  
  // GPT-4o 系列 (2025年最新)
  'gpt-4o': { context: 0.0025, generated: 0.01 },
  'gpt-4o-mini': { context: 0.00015, generated: 0.0006 },
  'gpt-4o-2024-05-13': { context: 0.005, generated: 0.015 },
  'gpt-4o-2024-08-06': { context: 0.0025, generated: 0.01 },
  
  // GPT-5 系列 (预览版)
  'gpt-5-chat-latest': { context: 0.00125, generated: 0.01 },
  
  // 其他模型
  'text-embedding-ada-002-v2': { context: 0.0001, generated: 0 },
  'whisper-1': { context: 0.0001, generated: 0 }
};

class OpenAICostCalculator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  formatDate(dateStr) {
    try {
      // 支持多种日期格式
      const formats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
        /^\d{2}-\d{2}$/, // MM-DD
        /^\d{2}\/\d{2}$/ // MM/DD
      ];

      if (formats[0].test(dateStr) || formats[1].test(dateStr)) {
        return dateStr.replace(/\//g, '-');
      }
      
      if (formats[2].test(dateStr) || formats[3].test(dateStr)) {
        const year = new Date().getFullYear();
        const cleaned = dateStr.replace(/\//g, '-');
        return `${year}-${cleaned}`;
      }
      
      return dateStr;
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  }

  async getUsageData(date) {
    try {
      const formattedDate = this.formatDate(date);
      const url = `https://api.openai.com/v1/usage?date=${formattedDate}`;
      
      console.error(`[INFO] 查询日期: ${formattedDate}`);
      
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 30000
      });

      const usageData = response.data.data || [];
      const whisperData = response.data.whisper_api_data || [];
      
      console.error(`[INFO] 获取到 ${usageData.length} 条usage数据，${whisperData.length} 条whisper数据`);
      
      return { usageData, whisperData };
    } catch (error) {
      console.error(`[ERROR] API请求失败: ${error.message}`);
      throw error;
    }
  }

  calculateCosts(usageData, whisperData) {
    let totalCost = 0;
    const modelCosts = {};

    // 处理usage数据
    usageData.forEach(data => {
      const model = data.snapshot_id;
      const contextTokens = data.n_context_tokens_total || 0;
      const generatedTokens = data.n_generated_tokens_total || 0;

      if (MODEL_COSTS[model]) {
        const contextCost = (contextTokens / 1000) * MODEL_COSTS[model].context;
        const generatedCost = (generatedTokens / 1000) * MODEL_COSTS[model].generated;
        const cost = contextCost + generatedCost;
        
        totalCost += cost;
        modelCosts[model] = (modelCosts[model] || 0) + cost;
      }
    });

    // 处理whisper数据
    whisperData.forEach(data => {
      const model = data.model_id;
      if (MODEL_COSTS[model]) {
        const numSeconds = data.num_seconds || 0;
        const cost = numSeconds * MODEL_COSTS[model].context;
        
        totalCost += cost;
        modelCosts[model] = (modelCosts[model] || 0) + cost;
      }
    });

    return { totalCost, modelCosts };
  }
}

class MCPServer {
  constructor() {
    this.initialized = false;
  }

  async handleRequest(request) {
    const { method, params = {}, id } = request;

    try {
      let result;

      switch (method) {
        case 'initialize':
          result = await this.handleInitialize(params);
          break;
        case 'tools/list':
          result = await this.handleToolsList();
          break;
        case 'tools/call':
          result = await this.handleToolsCall(params);
          break;
        default:
          result = {
            error: {
              code: -32601,
              message: `未知方法: ${method}`
            }
          };
      }

      if (id !== undefined) {
        result.id = id;
      }

      return result;
    } catch (error) {
      console.error(`[ERROR] 请求处理失败: ${error.message}`);
      const errorResult = {
        error: {
          code: -32603,
          message: `内部服务器错误: ${error.message}`
        }
      };
      
      if (id !== undefined) {
        errorResult.id = id;
      }
      
      return errorResult;
    }
  }

  async handleInitialize(params) {
    this.initialized = true;
    console.error('[INFO] MCP服务器初始化完成');
    
    return {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'openai-cost-mcp',
        version: '1.0.0'
      }
    };
  }

  async handleToolsList() {
    return {
      tools: [
        {
          name: 'query_openai_cost',
          description: '查询指定日期的OpenAI API使用情况和成本分析',
          inputSchema: {
            type: 'object',
            properties: {
              api_key: {
                type: 'string',
                description: 'OpenAI API密钥 (支持格式: sk-... 或 sk-proj-...)'
              },
              date: {
                type: 'string',
                description: '查询日期，支持格式: YYYY-MM-DD, YYYY/MM/DD, MM-DD, MM/DD'
              },
              granularity: {
                type: 'integer',
                description: '时间粒度（分钟），默认60',
                default: 60
              }
            },
            required: ['api_key', 'date']
          }
        },
        {
          name: 'get_model_pricing',
          description: '获取OpenAI各模型的定价信息',
          inputSchema: {
            type: 'object',
            properties: {
              model: {
                type: 'string',
                description: '指定模型名称，留空获取所有模型定价'
              }
            }
          }
        }
      ]
    };
  }

  async handleToolsCall(params) {
    const { name: toolName, arguments: args = {} } = params;

    switch (toolName) {
      case 'query_openai_cost':
        return await this.queryOpenAICost(args);
      case 'get_model_pricing':
        return await this.getModelPricing(args);
      default:
        return {
          content: [{
            type: 'text',
            text: `❌ 未知工具: ${toolName}`
          }]
        };
    }
  }

  async queryOpenAICost(args) {
    const { api_key: apiKey, date, granularity = 60 } = args;

    // 验证API Key - 支持新格式的项目密钥
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return {
        content: [{
          type: 'text',
          text: '❌ 请提供有效的OpenAI API密钥 (格式: sk-... 或 sk-proj-...)'
        }]
      };
    }

    // 检查API key长度 - 支持传统key(51字符)和项目key(~151字符)
    if (apiKey.length < 40 || apiKey.length > 200) {
      return {
        content: [{
          type: 'text',
          text: '❌ API密钥长度无效，请检查密钥是否完整'
        }]
      };
    }

    // 验证日期
    if (!date) {
      return {
        content: [{
          type: 'text',
          text: '❌ 请提供查询日期'
        }]
      };
    }

    try {
      const calculator = new OpenAICostCalculator(apiKey);
      const { usageData, whisperData } = await calculator.getUsageData(date);

      if (!usageData.length && !whisperData.length) {
        return {
          content: [{
            type: 'text',
            text: `📊 ${date} 当日无API使用记录，总成本: $0.00`
          }]
        };
      }

      const { totalCost, modelCosts } = calculator.calculateCosts(usageData, whisperData);

      let result = `📊 **OpenAI API成本分析 - ${date}**\n\n`;
      result += `💰 **总成本**: $${totalCost.toFixed(4)}\n\n`;

      if (Object.keys(modelCosts).length > 0) {
        result += '🤖 **各模型成本明细**:\n';
        const sortedModels = Object.entries(modelCosts)
          .sort((a, b) => b[1] - a[1]);
        
        sortedModels.forEach(([model, cost]) => {
          const percentage = totalCost > 0 ? (cost / totalCost * 100) : 0;
          result += `  • ${model}: $${cost.toFixed(4)} (${percentage.toFixed(1)}%)\n`;
        });
      }

      result += '\n✅ 数据来源: OpenAI Official Usage API';
      result += '\n🔒 安全提示: API密钥仅用于查询，不会被存储';

      return {
        content: [{
          type: 'text',
          text: result
        }]
      };

    } catch (error) {
      console.error(`[ERROR] 成本查询失败: ${error.message}`);
      
      if (error.response?.status === 401) {
        return {
          content: [{
            type: 'text',
            text: '❌ API密钥无效，请检查您的OpenAI API密钥'
          }]
        };
      }
      
      if (error.response?.status === 429) {
        return {
          content: [{
            type: 'text',
            text: '❌ API请求频率限制，请稍后重试'
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: `❌ 查询失败: ${error.message}`
        }]
      };
    }
  }

  async getModelPricing(args) {
    const { model } = args;

    if (model && MODEL_COSTS[model]) {
      const pricing = MODEL_COSTS[model];
      const result = `💰 **${model} 定价信息**:\n` +
        `  • 输入tokens: $${pricing.context.toFixed(4)}/1K tokens\n` +
        `  • 输出tokens: $${pricing.generated.toFixed(4)}/1K tokens`;
      
      return {
        content: [{
          type: 'text',
          text: result
        }]
      };
    } else {
      let result = '💰 **OpenAI模型定价表**:\n\n';
      
      const categories = {
        'GPT-3.5 系列': ['gpt-3.5-turbo-0301', 'gpt-3.5-turbo-0613', 'gpt-3.5-turbo-16k'],
        'GPT-4 系列': ['gpt-4-0314', 'gpt-4-0613', 'gpt-4-32k'],
        'GPT-4o 系列': ['gpt-4o', 'gpt-4o-mini', 'gpt-4o-2024-05-13'],
        'GPT-5 系列': ['gpt-5-chat-latest'],
        '其他模型': ['text-embedding-ada-002-v2', 'whisper-1']
      };

      Object.entries(categories).forEach(([category, models]) => {
        result += `**${category}**:\n`;
        models.forEach(modelName => {
          if (MODEL_COSTS[modelName]) {
            const pricing = MODEL_COSTS[modelName];
            result += `  • ${modelName}: Input $${pricing.context.toFixed(4)}/1K, Output $${pricing.generated.toFixed(4)}/1K\n`;
          }
        });
        result += '\n';
      });

      result += `总共支持 ${Object.keys(MODEL_COSTS).length} 个模型`;
      result += '\n\n🆕 包含最新的GPT-4o和GPT-5模型支持';

      return {
        content: [{
          type: 'text',
          text: result
        }]
      };
    }
  }
}

// 主程序
async function main() {
  console.error('[INFO] 🚀 启动 OpenAI Cost MCP 服务器 (JavaScript版)');
  
  const server = new MCPServer();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    try {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const request = JSON.parse(trimmedLine);
      const response = await server.handleRequest(request);
      
      console.log(JSON.stringify(response));
    } catch (error) {
      console.error(`[ERROR] 请求处理错误: ${error.message}`);
    }
  });

  rl.on('close', () => {
    console.error('[INFO] MCP服务器关闭');
    process.exit(0);
  });

  // 处理进程信号
  process.on('SIGINT', () => {
    console.error('[INFO] 收到SIGINT信号，正在关闭服务器...');
    rl.close();
  });

  process.on('SIGTERM', () => {
    console.error('[INFO] 收到SIGTERM信号，正在关闭服务器...');
    rl.close();
  });
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(error => {
    console.error(`[FATAL] 服务器启动失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { MCPServer, OpenAICostCalculator };
