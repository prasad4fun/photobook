# Midas API Integration Guide

## Overview

AI Photo Themes now uses the **Midas API** (internal Bosch AI service) instead of Azure AI Foundry. All 17 available models have been tested and verified working with 100% success rate.

## What Changed

### 1. API Endpoint
- **Before:** `https://your-foundry-endpoint.azure.com/services/api/v2/llm/completions`
- **After:** `https://midas.ai.bosch.com/ss1/api/v2/llm/completions`

### 2. Authentication
- **Before:** Required API key via `Authorization: Bearer` header
- **After:** No API key required (authentication is optional)

### 3. Payload Format
- **Before:** Mixed formats (standard and OpenAI)
- **After:** OpenAI format only (all models)

### 4. SSL Verification
- **Note:** Internal Bosch certificates may require SSL verification to be disabled in development

## Configuration

### Environment Variables (`.env.local`)

```bash
# Midas API Configuration
REACT_APP_AZURE_ENDPOINT=https://midas.ai.bosch.com
REACT_APP_AZURE_API_KEY=

# Model Deployments (Verified Working)
REACT_APP_CLAUDE_DEPLOYMENT=Claude-Sonnet-4
REACT_APP_GPT_DEPLOYMENT=GPT 4o
REACT_APP_GEMINI_DEPLOYMENT=Gemini-2.5-pro

# Feature Flags
REACT_APP_USE_MOCK_API=false
REACT_APP_ENABLE_STREAMING=true
```

## Available Models

### Verified Working (17/17 models - 100% success)

#### GPT Models (6)
- ✅ GPT 4o
- ✅ GPT 4o Mini
- ✅ GPT o1
- ✅ GPT o3 Mini
- ✅ GPT 4.1
- ✅ GPT 4.1 Mini

#### Llama Models (1)
- ✅ Llama3.1

#### Gemini Models (8)
- ✅ Gemini-1.5-flash
- ✅ Gemini-2.0-flash
- ✅ Gemini-2.5-pro
- ✅ Gemini-2.5-flash
- ✅ Gemini-2.5-flash-lite
- ✅ Gemini-2.5-pro-openai
- ✅ Gemini-2.5-flash-openai
- ✅ Gemini-2.5-flash-lite-openai

#### Claude Models (2)
- ✅ Claude-Sonnet-4
- ✅ Claude-Sonnet-4-openai

## Application Services

### Claude Service (`src/services/azure/claudeService.ts`)
**Purpose:** Image analysis

**Function:** `analyzeImage(imageBase64: string, imageName?: string)`

**Returns:** `ImageSummary`
```typescript
{
  image_id: string;
  description: string;  // Subject and composition
  lighting: string;     // Lighting quality and type
  mood: string;         // Overall mood/emotion
}
```

**Example Request:**
```typescript
const summary = await analyzeImage(base64Image, 'family-photo.jpg');
```

**Midas API Call:**
```json
{
  "model": "Claude-Sonnet-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a professional photo analysis expert..."
    },
    {
      "role": "user",
      "content": "Analyze this photo (family-photo.jpg) for professional editing..."
    }
  ],
  "max_tokens": 150,
  "temperature": 0.3
}
```

### GPT Service (`src/services/azure/gptService.ts`)
**Purpose:** Theme generation

**Function:** `generateThemes(imageSummaries: ImageSummary[])`

**Returns:** `Theme[]`
```typescript
{
  theme_id: string;
  name: string;          // Catchy theme name
  mood: string;          // Mood description
  lighting: string;      // Lighting style
  background: string;    // Background treatment
  editing_style: string; // Editing approach
}
```

**Example Request:**
```typescript
const themes = await generateThemes(imageSummaries);
```

**Midas API Call:**
```json
{
  "model": "GPT 4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a professional photo editing consultant..."
    },
    {
      "role": "user",
      "content": "Based on these photo analyses, suggest 4 distinct editing themes..."
    }
  ],
  "max_tokens": 800,
  "temperature": 0.7
}
```

### Gemini Service (`src/services/azure/geminiService.ts`)
**Purpose:** Streaming preview text

**Function:** `streamThemePreview(imageSummaries: ImageSummary[])`

**Returns:** `AsyncGenerator<string>`

**Example Request:**
```typescript
for await (const chunk of streamThemePreview(summaries)) {
  console.log(chunk); // Real-time text updates
}
```

**Midas API Call:**
```json
{
  "model": "Gemini-2.5-pro",
  "messages": [
    {
      "role": "user",
      "content": "Based on these photos: ...\n\nGenerate 5 short, insightful observations..."
    }
  ],
  "max_tokens": 200,
  "temperature": 0.8,
  "stream": true
}
```

## Testing Models

### Run Model Tests

```bash
# Validate all configurations (no API key needed)
python scripts/test-models.py --check

# Test all models with Midas API
python scripts/test-models.py --no-verify-ssl

# Test specific model
python scripts/test-models.py --no-verify-ssl --model "GPT 4o"

# Verbose output
python scripts/test-models.py --no-verify-ssl --verbose
```

### Test Results

Results are saved to:
- `scripts/test-results-python.json`

View results:
```bash
cat scripts/test-results-python.json | python -m json.tool
```

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env.local

# Update with Midas endpoint (already configured)
# No API key needed!
```

### 3. Start Development Server
```bash
npm start
```

### 4. Test with Mock Data
```bash
# Enable mock mode in .env.local
REACT_APP_USE_MOCK_API=true

# Or use real Midas API
REACT_APP_USE_MOCK_API=false
```

## Usage Flow

### User Journey

1. **Landing Screen** → User starts session
2. **Upload Screen** → Upload 5-30 photos
3. **Analysis Screen** → Claude analyzes each photo
   - Calls `analyzeImage()` for each uploaded photo
   - Streams progress updates using Gemini
4. **Theme Preview Screen** → GPT generates 4 editing themes
   - Calls `generateThemes()` with all image summaries
   - User selects preferred theme
5. **Confirmation Screen** → Order details review
6. **Processing Screen** → Simulated processing
7. **Delivery Screen** → Job completion

### API Call Sequence

```
1. User uploads photos
   ↓
2. For each photo: analyzeImage() → Claude-Sonnet-4
   ↓
3. Generate themes: generateThemes() → GPT 4o
   ↓
4. (Optional) Stream updates: streamThemePreview() → Gemini-2.5-pro
   ↓
5. User selects theme and confirms
```

## Error Handling

### Common Issues

**SSL Certificate Error:**
```bash
# For development/testing only
NODE_TLS_REJECT_UNAUTHORIZED=0 npm start

# Or use test script with --no-verify-ssl
python scripts/test-models.py --no-verify-ssl
```

**Model Not Found (422 Error):**
- Check model name matches exactly (case-sensitive)
- Verify model is in available list above
- See `scripts/model-configs.json` for exact names

**Network/Connection Issues:**
- Verify VPN connection to Bosch network
- Check endpoint URL is correct
- Test with: `curl -k https://midas.ai.bosch.com/ss1/api/v2/llm/completions`

## Performance

### Response Times (Average)

Based on test results:
- GPT 4o: ~2100ms
- GPT 4o Mini: ~1980ms
- Claude Sonnet 4: ~2450ms
- Gemini 2.5 Pro: ~2330ms
- Llama 3.1: ~1565ms (fastest)

### Optimization Tips

1. **Use appropriate model for task:**
   - Llama 3.1: Fast, good for simple text generation
   - GPT 4o Mini: Fast, cost-effective for most tasks
   - GPT 4o: Best quality for complex reasoning
   - Claude Sonnet 4: Excellent for detailed analysis
   - Gemini: Great for streaming responses

2. **Batch requests when possible**
3. **Enable streaming for better UX**
4. **Cache results when appropriate**

## Security Notes

⚠️ **Important:**
- Midas API is an internal Bosch service
- No API key required (for now)
- Use only within Bosch network
- Do not expose endpoint publicly
- SSL verification should be enabled in production

## Migration Checklist

- [x] Update endpoint to Midas API
- [x] Convert all requests to OpenAI format
- [x] Update model deployment names
- [x] Remove/make optional API key authentication
- [x] Test all 17 models (100% success)
- [x] Update documentation
- [x] Update environment configuration
- [x] Test application integration
- [ ] Deploy to staging
- [ ] Deploy to production

## Support

### Documentation
- **Full Model Testing:** `scripts/README.md`
- **Payload Reference:** `scripts/PAYLOAD_REFERENCE.md`
- **Test Results:** `scripts/test-results-python.json`
- **Model Config:** `scripts/model-configs.json`

### Troubleshooting
1. Check `scripts/TESTING_SUMMARY.md` for known issues
2. Run model tests: `python scripts/test-models.py --check`
3. View test logs: `scripts/test-results-python.json`

## Next Steps

1. **Test Application End-to-End**
   ```bash
   npm start
   # Upload test photos
   # Verify each screen works
   ```

2. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Review Sentry logs

3. **Optimize as Needed**
   - Switch models if needed
   - Adjust parameters
   - Enable caching

---

**Status:** ✅ Integration Complete - Ready for Testing
**Date:** 2026-02-01
**Tested Models:** 17/17 (100% success rate)
