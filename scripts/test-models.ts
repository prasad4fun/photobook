/**
 * Standalone script to test all available models on Midas API
 *
 * Usage:
 *   npx ts-node scripts/test-models.ts
 *   npx ts-node scripts/test-models.ts --api-key YOUR_API_KEY
 *   npx ts-node scripts/test-models.ts --model "GPT 4o"
 *   npx ts-node scripts/test-models.ts --verbose
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
interface ModelConfig {
  name: string;
  deploymentName: string;
  format: 'standard' | 'openai';
  samplePayload: any;
  note?: string;
}

interface ConfigFile {
  endpoint: string;
  testQuery: {
    systemPrompt: string;
    userMessage: string;
    expectedResponse: string;
  };
  models: {
    [key: string]: ModelConfig[];
  };
}

interface TestResult {
  model: string;
  deploymentName: string;
  format: string;
  success: boolean;
  responseTime: number;
  error?: string;
  response?: string;
  statusCode?: number;
}

// Configuration
const CONFIG_PATH = path.join(__dirname, 'model-configs.json');
const API_KEY = process.env.REACT_APP_AZURE_API_KEY || process.env.MIDAS_API_KEY || '';

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const specificModel = args.find(arg => arg.startsWith('--model='))?.split('=')[1];
const apiKeyArg = args.find(arg => arg.startsWith('--api-key='))?.split('=')[1];
const finalApiKey = apiKeyArg || API_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

// Load configuration
function loadConfig(): ConfigFile {
  try {
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    log(`Error loading config from ${CONFIG_PATH}:`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Test a single model
async function testModel(
  endpoint: string,
  apiKey: string,
  model: ModelConfig
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    log(`  Testing ${model.name} (${model.deploymentName})...`, 'gray');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(model.samplePayload),
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        model: model.name,
        deploymentName: model.deploymentName,
        format: model.format,
        success: false,
        responseTime,
        statusCode: response.status,
        error: data.error?.message || data.message || JSON.stringify(data),
      };
    }

    // Extract response text based on format
    let responseText = '';
    if (model.format === 'openai') {
      responseText = data.choices?.[0]?.message?.content || '';
    } else {
      const content = data.choices?.[0]?.message?.content;
      if (Array.isArray(content)) {
        responseText = content[0]?.text || '';
      } else if (typeof content === 'string') {
        responseText = content;
      }
    }

    return {
      model: model.name,
      deploymentName: model.deploymentName,
      format: model.format,
      success: true,
      responseTime,
      statusCode: response.status,
      response: responseText,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      model: model.name,
      deploymentName: model.deploymentName,
      format: model.format,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test all models
async function testAllModels() {
  logSection('MIDAS API Model Availability Test');

  if (!finalApiKey) {
    log('❌ Error: No API key provided!', 'red');
    log('Set REACT_APP_AZURE_API_KEY or MIDAS_API_KEY environment variable', 'yellow');
    log('Or use: --api-key=YOUR_KEY', 'yellow');
    process.exit(1);
  }

  log(`API Key: ${finalApiKey.substring(0, 10)}...`, 'gray');

  const config = loadConfig();
  log(`Endpoint: ${config.endpoint}`, 'gray');
  log(`Verbose mode: ${verbose ? 'ON' : 'OFF'}`, 'gray');

  if (specificModel) {
    log(`Testing specific model: ${specificModel}`, 'yellow');
  }

  const results: TestResult[] = [];
  let totalTests = 0;
  let successCount = 0;
  let failCount = 0;

  // Test each model category
  for (const [category, models] of Object.entries(config.models)) {
    logSection(`Testing ${category.toUpperCase()} Models`);

    for (const model of models) {
      // Skip if specific model requested and this isn't it
      if (specificModel && model.name !== specificModel && model.deploymentName !== specificModel) {
        continue;
      }

      totalTests++;
      const result = await testModel(config.endpoint, finalApiKey, model);
      results.push(result);

      if (result.success) {
        successCount++;
        log(`  ✅ ${result.model} - ${result.responseTime}ms`, 'green');
        if (verbose && result.response) {
          log(`     Response: ${result.response.substring(0, 100)}...`, 'gray');
        }
      } else {
        failCount++;
        log(`  ❌ ${result.model} - ${result.responseTime}ms`, 'red');
        if (result.statusCode) {
          log(`     Status: ${result.statusCode}`, 'red');
        }
        if (result.error) {
          log(`     Error: ${result.error.substring(0, 200)}`, 'red');
        }
      }

      if (model.note) {
        log(`     Note: ${model.note}`, 'yellow');
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  logSection('Test Summary');
  log(`Total tests: ${totalTests}`, 'cyan');
  log(`✅ Successful: ${successCount}`, 'green');
  log(`❌ Failed: ${failCount}`, 'red');
  log(`Success rate: ${((successCount / totalTests) * 100).toFixed(1)}%`, 'cyan');

  // Save results to file
  const resultsPath = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(
    resultsPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalTests,
        successCount,
        failCount,
        results,
      },
      null,
      2
    )
  );
  log(`\n📝 Results saved to: ${resultsPath}`, 'blue');

  // List working models
  if (successCount > 0) {
    logSection('Working Models');
    results
      .filter(r => r.success)
      .forEach(r => {
        log(`  ✅ ${r.model} (${r.deploymentName}) - ${r.format} format`, 'green');
      });
  }

  // List failed models
  if (failCount > 0) {
    logSection('Failed Models');
    results
      .filter(r => !r.success)
      .forEach(r => {
        log(`  ❌ ${r.model} (${r.deploymentName})`, 'red');
        if (r.error) {
          log(`     ${r.error.substring(0, 100)}`, 'gray');
        }
      });
  }

  console.log('\n');
}

// Run tests
testAllModels().catch(error => {
  log('Fatal error:', 'red');
  console.error(error);
  process.exit(1);
});
