# Midas API Model Testing

This directory contains testing utilities to verify which AI models are available on the Midas API endpoint and ensure proper payload formatting.

## Files Overview

- **`model-configs.json`** - Configuration file containing all available models and their proper payload structures
- **`test-models.ts`** - Standalone TypeScript script for comprehensive model testing
- **`test-results.json`** - Generated file containing test results (created after running tests)

## Available Models

The Midas API provides access to multiple AI model families:

### GPT Models (OpenAI)
- GPT 4o
- GPT 4o Mini
- GPT o1 *(no system messages or temperature)*
- GPT o3 Mini *(no system messages or temperature)*
- GPT 4.1
- GPT 4.1 Mini

### Llama Models
- Llama 3.1

### Gemini Models (Google)
**Standard Format:**
- Gemini 1.5 Flash
- Gemini 2.0 Flash
- Gemini 2.5 Pro
- Gemini 2.5 Flash
- Gemini 2.5 Flash Lite

**OpenAI Format:**
- Gemini 2.5 Pro (OpenAI)
- Gemini 2.5 Flash (OpenAI)
- Gemini 2.5 Flash Lite (OpenAI)

### Claude Models (Anthropic)
**Standard Format:**
- Claude Sonnet 4

**OpenAI Format:**
- Claude Sonnet 4 (OpenAI)

## API Endpoint

```
https://midas.ai.bosch.com/ss1/api/v2/llm/completions
```

## Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure API Key

Set your Midas API key in one of the following ways:

**Option A: Environment Variable**
```bash
export REACT_APP_AZURE_API_KEY="your-api-key-here"
# or
export MIDAS_API_KEY="your-api-key-here"
```

**Option B: .env File**
```bash
# Create or edit .env file in project root
REACT_APP_AZURE_API_KEY=your-api-key-here
```

**Option C: Command Line Argument**
```bash
npx ts-node scripts/test-models.ts --api-key=your-api-key-here
```

### 3. Install ts-node (if not already installed)

```bash
npm install -g ts-node
# or
npm install --save-dev ts-node
```

## Running Tests

### Standalone Script (Recommended)

**Test All Models:**
```bash
npx ts-node scripts/test-models.ts
```

**Test Specific Model:**
```bash
npx ts-node scripts/test-models.ts --model="GPT 4o"
npx ts-node scripts/test-models.ts --model="Claude Sonnet 4"
npx ts-node scripts/test-models.ts --model="Gemini-2.5-pro"
```

**Verbose Output:**
```bash
npx ts-node scripts/test-models.ts --verbose
npx ts-node scripts/test-models.ts -v
```

**With Custom API Key:**
```bash
npx ts-node scripts/test-models.ts --api-key=your-key-here
```

### Jest Integration Tests

**Run Jest Tests:**
```bash
npm test -- api-models.test.ts
```

**With API Key:**
```bash
REACT_APP_AZURE_API_KEY=your-key npm test -- api-models.test.ts
```

**Watch Mode:**
```bash
npm test -- --watch api-models.test.ts
```

## Payload Formats

### Standard Format (Default)

Used by most models:

```json
{
  "deploymentName": "GPT 4o",
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "You are a helpful AI assistant."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Hello"
        }
      ]
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 100
}
```

### OpenAI Format

Used by models with `-openai` suffix:

```json
{
  "model": "Claude-Sonnet-4-openai",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful AI assistant."
    },
    {
      "role": "user",
      "content": "Hello"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 100
}
```

### Special Cases

**GPT o1/o3 Models:**
- Do NOT support `system` messages
- Do NOT support `temperature` parameter
- Only use `user` messages

```json
{
  "deploymentName": "GPT o1",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Hello"
        }
      ]
    }
  ],
  "stream": false
}
```

## Output Examples

### Successful Test Output

```
================================================================================
MIDAS API Model Availability Test
================================================================================

API Key: sk-1234567...
Endpoint: https://midas.ai.bosch.com/ss1/api/v2/llm/completions
Verbose mode: OFF

================================================================================
Testing GPT Models
================================================================================

  Testing GPT 4o (GPT 4o)...
  ✅ GPT 4o - 1234ms
  Testing GPT 4o Mini (GPT 4o Mini)...
  ✅ GPT 4o Mini - 987ms

================================================================================
Test Summary
================================================================================

Total tests: 17
✅ Successful: 15
❌ Failed: 2
Success rate: 88.2%

📝 Results saved to: scripts/test-results.json
```

### Test Results File

After running tests, `test-results.json` will contain:

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "totalTests": 17,
  "successCount": 15,
  "failCount": 2,
  "results": [
    {
      "model": "GPT 4o",
      "deploymentName": "GPT 4o",
      "format": "standard",
      "success": true,
      "responseTime": 1234,
      "statusCode": 200,
      "response": "Hello! Model working."
    },
    {
      "model": "Some Model",
      "deploymentName": "some-model",
      "format": "standard",
      "success": false,
      "responseTime": 567,
      "statusCode": 404,
      "error": "Model not found"
    }
  ]
}
```

## Troubleshooting

### API Key Issues

**Error:** "No API key provided"
- **Solution:** Set `REACT_APP_AZURE_API_KEY` or `MIDAS_API_KEY` environment variable

### Model Not Found

**Error:** "Model not found" or 404 status
- **Solution:** The model may not be available in your Midas instance
- Check `model-configs.json` for correct deployment names
- Verify with your Midas administrator

### Rate Limiting

**Error:** 429 Too Many Requests
- **Solution:** The script includes 500ms delays between requests
- Increase delay in `test-models.ts` if needed

### Authentication Errors

**Error:** 401 Unauthorized
- **Solution:** Verify your API key is correct and has proper permissions

### Network Issues

**Error:** "Failed to fetch" or connection errors
- **Solution:** Check network connectivity and VPN if required
- Verify endpoint URL is correct

## Adding New Models

To add a new model to the configuration:

1. Open `scripts/model-configs.json`
2. Add the model to the appropriate category:

```json
{
  "name": "New Model Name",
  "deploymentName": "new-model-deployment",
  "format": "standard",
  "samplePayload": {
    "deploymentName": "new-model-deployment",
    "messages": [
      {
        "role": "system",
        "content": [{"type": "text", "text": "You are a helpful AI assistant."}]
      },
      {
        "role": "user",
        "content": [{"type": "text", "text": "Hello"}]
      }
    ],
    "stream": false,
    "temperature": 0.7,
    "max_tokens": 100
  },
  "note": "Optional note about special requirements"
}
```

3. Run tests to verify the new model works

## Integration with Application

To use a specific model in your application:

```typescript
import { azureConfig, getHeaders } from './services/azure/config';
import modelConfigs from '../scripts/model-configs.json';

// Get model configuration
const gpt4oConfig = modelConfigs.models.gpt.find(
  m => m.deploymentName === 'GPT 4o'
);

// Make API call
const response = await fetch(modelConfigs.endpoint, {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify({
    ...gpt4oConfig.samplePayload,
    messages: [/* your messages */]
  })
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Midas Models

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx ts-node scripts/test-models.ts
        env:
          MIDAS_API_KEY: ${{ secrets.MIDAS_API_KEY }}
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test output in `test-results.json`
3. Contact your Midas administrator for API access issues
4. Review Midas API documentation

## License

This project is part of the AI Photo Themes application.
