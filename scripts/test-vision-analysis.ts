/**
 * Vision/Image Analysis Test Script for Midas API
 *
 * Tests vision capabilities of Claude Sonnet-4, GPT-4o, and Gemini models
 *
 * Usage:
 *   # Test with a local image file
 *   npx ts-node scripts/test-vision-analysis.ts --image path/to/image.jpg
 *
 *   # Test with a URL image
 *   npx ts-node scripts/test-vision-analysis.ts --url https://example.com/image.jpg
 *
 *   # Test with a specific model
 *   npx ts-node scripts/test-vision-analysis.ts --image photo.jpg --model "GPT 4o"
 *
 *   # Verbose output
 *   npx ts-node scripts/test-vision-analysis.ts --image photo.jpg --verbose
 *
 *   # Generate a test pattern image
 *   npx ts-node scripts/test-vision-analysis.ts --generate-test-image
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
interface VisionTestResult {
  model: string;
  success: boolean;
  responseTime: number;
  response?: string;
  error?: string;
  statusCode?: number;
  tokensUsed?: number;
}

interface ModelConfig {
  name: string;
  deploymentName: string;
  supportsVision: boolean;
}

// Configuration
const ENDPOINT = 'https://midas.ai.bosch.com/ss1/api/v2/llm/completions';
const API_KEY = process.env.REACT_APP_AZURE_API_KEY || process.env.MIDAS_API_KEY || '';

// Models to test (vision-capable)
const MODELS: ModelConfig[] = [
  { name: 'Claude Sonnet-4', deploymentName: 'Claude-Sonnet-4', supportsVision: true },
  { name: 'GPT 4o', deploymentName: 'GPT 4o', supportsVision: true },
  { name: 'GPT 4.1', deploymentName: 'GPT 4.1', supportsVision: true },
  { name: 'Gemini 2.5 Pro', deploymentName: 'Gemini-2.5-pro', supportsVision: true },
  { name: 'Gemini 2.0 Flash', deploymentName: 'Gemini-2.0-flash', supportsVision: true },
];

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const imagePath = args.find(arg => arg.startsWith('--image='))?.split('=')[1] ||
                  args[args.indexOf('--image') + 1];
const imageUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] ||
                 args[args.indexOf('--url') + 1];
const specificModel = args.find(arg => arg.startsWith('--model='))?.split('=')[1];
const generateTest = args.includes('--generate-test-image');
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

/**
 * Convert image file to base64
 */
function imageToBase64(filePath: string): string {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error(`Failed to read image file: ${error}`);
  }
}

/**
 * Download image from URL and convert to base64
 */
async function downloadImageToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    throw new Error(`Failed to download image from URL: ${error}`);
  }
}

/**
 * Generate a simple test image (colored squares pattern)
 * Returns base64 encoded PNG
 */
function generateTestImage(): string {
  // Create a simple test pattern as SVG, then convert to base64
  // This is a simple colored square pattern
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="400" height="300" fill="#f0f0f0"/>

  <!-- Colored squares -->
  <rect x="50" y="50" width="80" height="80" fill="#FF6B6B" stroke="#000" stroke-width="2"/>
  <rect x="160" y="50" width="80" height="80" fill="#4ECDC4" stroke="#000" stroke-width="2"/>
  <rect x="270" y="50" width="80" height="80" fill="#45B7D1" stroke="#000" stroke-width="2"/>

  <rect x="105" y="160" width="80" height="80" fill="#FFA07A" stroke="#000" stroke-width="2"/>
  <rect x="215" y="160" width="80" height="80" fill="#98D8C8" stroke="#000" stroke-width="2"/>

  <!-- Text -->
  <text x="200" y="30" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">
    Test Pattern
  </text>
</svg>`;

  // Convert SVG to base64
  return Buffer.from(svg).toString('base64');
}

/**
 * Save generated test image to file
 */
function saveTestImage(base64Data: string, outputPath: string) {
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(outputPath, buffer);
  log(`✅ Test image saved to: ${outputPath}`, 'green');
}

/**
 * Test vision analysis with a single model
 */
async function testVisionModel(
  model: ModelConfig,
  imageBase64: string,
  imageType: string = 'jpeg'
): Promise<VisionTestResult> {
  const startTime = Date.now();

  try {
    log(`  Testing ${model.name}...`, 'gray');

    // Prepare the vision request (OpenAI format)
    const request = {
      model: model.deploymentName,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image in detail. Describe:
1. What you see in the image (objects, people, scene)
2. Colors and composition
3. Lighting conditions
4. Overall mood or atmosphere
5. Any text visible in the image

Be specific and detailed.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/${imageType};base64,${imageBase64}`,
                detail: 'high' // Request high detail analysis
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    };

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(finalApiKey ? { 'Authorization': `Bearer ${finalApiKey}` } : {}),
      },
      body: JSON.stringify(request),
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        model: model.name,
        success: false,
        responseTime,
        statusCode: response.status,
        error: data.error?.message || data.message || JSON.stringify(data),
      };
    }

    // Extract response text (handle both wrapped and unwrapped responses)
    const wrappedData = data.data || data;
    const content = wrappedData.choices?.[0]?.message?.content || '';
    const tokensUsed = wrappedData.usage?.total_tokens;

    return {
      model: model.name,
      success: true,
      responseTime,
      statusCode: response.status,
      response: content,
      tokensUsed,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      model: model.name,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main test function
 */
async function runVisionTests() {
  logSection('🔍 Midas API Vision/Image Analysis Test');

  // Handle test image generation
  if (generateTest) {
    logSection('Generating Test Image');
    const testImageBase64 = generateTestImage();
    const outputPath = path.join(__dirname, 'test-pattern.svg');
    saveTestImage(testImageBase64, outputPath);
    log('\nYou can now test with this image:', 'yellow');
    log(`  npx ts-node scripts/test-vision-analysis.ts --image ${outputPath}`, 'cyan');
    return;
  }

  // Validate inputs
  if (!imagePath && !imageUrl) {
    log('❌ Error: No image source provided!', 'red');
    log('\nUsage:', 'yellow');
    log('  --image path/to/image.jpg    Load image from file', 'cyan');
    log('  --url https://example.com/image.jpg    Load image from URL', 'cyan');
    log('  --generate-test-image         Generate a test pattern SVG', 'cyan');
    log('  --model "GPT 4o"             Test specific model only', 'cyan');
    log('  --verbose                     Show full responses', 'cyan');
    process.exit(1);
  }

  // Load image
  let imageBase64: string;
  let imageType: string = 'jpeg';

  try {
    if (imagePath) {
      log(`Loading image from file: ${imagePath}`, 'gray');
      imageBase64 = imageToBase64(imagePath);

      // Detect image type from extension
      const ext = path.extname(imagePath).toLowerCase();
      if (ext === '.png') imageType = 'png';
      else if (ext === '.gif') imageType = 'gif';
      else if (ext === '.webp') imageType = 'webp';
      else if (ext === '.svg') imageType = 'svg+xml';

      const fileSizeKB = Math.round(Buffer.from(imageBase64, 'base64').length / 1024);
      log(`✅ Image loaded: ${fileSizeKB} KB (${imageType})`, 'green');
    } else if (imageUrl) {
      log(`Downloading image from URL: ${imageUrl}`, 'gray');
      imageBase64 = await downloadImageToBase64(imageUrl);
      const fileSizeKB = Math.round(Buffer.from(imageBase64, 'base64').length / 1024);
      log(`✅ Image downloaded: ${fileSizeKB} KB`, 'green');
    } else {
      throw new Error('No image source provided');
    }
  } catch (error) {
    log(`❌ Failed to load image: ${error}`, 'red');
    process.exit(1);
  }

  // Filter models if specific model requested
  const modelsToTest = specificModel
    ? MODELS.filter(m => m.name === specificModel || m.deploymentName === specificModel)
    : MODELS;

  if (modelsToTest.length === 0) {
    log(`❌ Model not found: ${specificModel}`, 'red');
    log('Available models:', 'yellow');
    MODELS.forEach(m => log(`  - ${m.name}`, 'cyan'));
    process.exit(1);
  }

  // Run tests
  logSection('Running Vision Analysis Tests');
  const results: VisionTestResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const model of modelsToTest) {
    const result = await testVisionModel(model, imageBase64, imageType);
    results.push(result);

    if (result.success) {
      successCount++;
      log(`  ✅ ${result.model} - ${result.responseTime}ms`, 'green');
      if (result.tokensUsed) {
        log(`     Tokens used: ${result.tokensUsed}`, 'gray');
      }
      if (verbose && result.response) {
        log(`\n     Response:`, 'cyan');
        log(`     ${result.response.substring(0, 500)}${result.response.length > 500 ? '...' : ''}`, 'gray');
        log('', 'reset');
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

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  logSection('Test Summary');
  log(`Total tests: ${results.length}`, 'cyan');
  log(`✅ Successful: ${successCount}`, 'green');
  log(`❌ Failed: ${failCount}`, 'red');
  if (results.length > 0) {
    log(`Success rate: ${((successCount / results.length) * 100).toFixed(1)}%`, 'cyan');
  }

  // Average response time for successful tests
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
    log(`Average response time: ${Math.round(avgTime)}ms`, 'cyan');
  }

  // Save results to file
  const resultsPath = path.join(__dirname, 'vision-test-results.json');
  fs.writeFileSync(
    resultsPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        imageSource: imagePath || imageUrl,
        imageType,
        totalTests: results.length,
        successCount,
        failCount,
        results: results.map(r => ({
          ...r,
          // Truncate response in saved file for readability
          response: r.response ? r.response.substring(0, 500) : undefined,
        })),
      },
      null,
      2
    )
  );
  log(`\n📝 Results saved to: ${resultsPath}`, 'blue');

  // Show full responses if not in verbose mode
  if (!verbose && successCount > 0) {
    logSection('Sample Responses (first 200 chars each)');
    results
      .filter(r => r.success && r.response)
      .forEach(r => {
        log(`\n${r.model}:`, 'cyan');
        log(r.response!.substring(0, 200) + '...', 'gray');
      });
    log('\n💡 Use --verbose flag to see full responses', 'yellow');
  }

  console.log('\n');
}

// Run tests
runVisionTests().catch(error => {
  log('Fatal error:', 'red');
  console.error(error);
  process.exit(1);
});
