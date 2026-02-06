# Vision/Image Analysis Testing Guide

This guide explains how to test vision capabilities of the Midas API models.

## Overview

The Midas API supports **vision/image analysis** (not image generation). These scripts test how well the models can:
- Analyze image content
- Identify objects, colors, and composition
- Detect lighting conditions
- Recognize text in images
- Describe mood and atmosphere

## Available Vision Models

| Model | Deployment Name | Vision Support |
|-------|----------------|----------------|
| Claude Sonnet-4 | `Claude-Sonnet-4` | ✅ Yes |
| GPT 4o | `GPT 4o` | ✅ Yes |
| GPT 4.1 | `GPT 4.1` | ✅ Yes |
| Gemini 2.5 Pro | `Gemini-2.5-pro` | ✅ Yes |
| Gemini 2.0 Flash | `Gemini-2.0-flash` | ✅ Yes |

## Quick Start

### 1. Generate a Test Image

```bash
# Python
python scripts/test-vision-analysis.py --generate-test-image

# TypeScript
npx ts-node scripts/test-vision-analysis.ts --generate-test-image
```

This creates `scripts/test-pattern.svg` - a colored squares pattern for testing.

### 2. Test with Generated Image

```bash
# Python - Test all models
python scripts/test-vision-analysis.py --image scripts/test-pattern.svg

# Python - Test specific model
python scripts/test-vision-analysis.py --image scripts/test-pattern.svg --model "Claude Sonnet-4"

# TypeScript - Test all models
npx ts-node scripts/test-vision-analysis.ts --image scripts/test-pattern.svg

# TypeScript - Verbose output
npx ts-node scripts/test-vision-analysis.ts --image scripts/test-pattern.svg --verbose
```

### 3. Test with Your Own Image

```bash
# Local image file
python scripts/test-vision-analysis.py --image /path/to/your/photo.jpg

# Image from URL
python scripts/test-vision-analysis.py --url https://example.com/image.jpg

# With verbose output to see full analysis
python scripts/test-vision-analysis.py --image photo.jpg --verbose
```

## Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--image PATH` | Path to local image file | `--image photo.jpg` |
| `--url URL` | URL to image file | `--url https://...` |
| `--model NAME` | Test specific model only | `--model "GPT 4o"` |
| `--api-key KEY` | Midas API key (optional) | `--api-key abc123` |
| `--verbose` / `-v` | Show full responses | `--verbose` |
| `--generate-test-image` | Generate test pattern | `--generate-test-image` |

## Supported Image Formats

- JPEG/JPG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- SVG (`.svg`)

## API Request Format

The scripts use the OpenAI Vision API format:

```json
{
  "model": "Claude-Sonnet-4",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Analyze this image..."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,{base64_data}",
            "detail": "high"
          }
        }
      ]
    }
  ],
  "max_tokens": 500,
  "temperature": 0.3
}
```

## Understanding Results

### Success Output

```
✅ Claude Sonnet-4 - 2341ms
   Tokens used: 487
```

- **Model name**: Which model was tested
- **Response time**: Time taken in milliseconds
- **Tokens used**: Total tokens consumed (input + output)

### Error Output

```
❌ GPT 4o - 1523ms
   Status: 400
   Error: Invalid image format
```

- **Status code**: HTTP response code
- **Error**: Detailed error message

### Results File

Results are saved to `scripts/vision-test-results.json`:

```json
{
  "timestamp": "2026-02-01T10:30:00.000Z",
  "image_source": "test-pattern.svg",
  "image_type": "svg+xml",
  "total_tests": 5,
  "success_count": 5,
  "fail_count": 0,
  "results": [...]
}
```

## Example Test Session

```bash
# Generate test image
$ python scripts/test-vision-analysis.py --generate-test-image
✅ Test image saved to: scripts/test-pattern.svg

# Test all models with verbose output
$ python scripts/test-vision-analysis.py --image scripts/test-pattern.svg --verbose

================================================================================
🔍 Midas API Vision/Image Analysis Test
================================================================================

Loading image from file: scripts/test-pattern.svg
✅ Image loaded: 1 KB (svg+xml)

================================================================================
Running Vision Analysis Tests
================================================================================

  Testing Claude Sonnet-4...
  ✅ Claude Sonnet-4 - 2341ms
     Tokens used: 487

     Response:
     This image shows a test pattern consisting of five colored squares
     arranged in a specific layout. The top row contains three squares:
     red on the left, turquoise in the middle, and light blue on the right...

  Testing GPT 4o...
  ✅ GPT 4o - 1823ms
     Tokens used: 421

     Response:
     The image displays a simple geometric pattern with the text "Test Pattern"
     at the top. Below are five colored rectangles with black borders...

================================================================================
Test Summary
================================================================================

Total tests: 5
✅ Successful: 5
❌ Failed: 0
Success rate: 100.0%
Average response time: 2103ms

📝 Results saved to: scripts/vision-test-results.json
```

## Troubleshooting

### "No API key provided"

The Midas API may not require authentication. If you see this warning but tests still work, you can ignore it. Otherwise:

```bash
export MIDAS_API_KEY="your-key-here"
# or
python scripts/test-vision-analysis.py --api-key "your-key-here"
```

### "Failed to read image file"

- Check the file path is correct
- Ensure the file is a valid image format
- Try using an absolute path instead of relative

### "Invalid image format"

- Some models may not support SVG - try JPEG or PNG instead
- Ensure the image is not corrupted
- Check the image size (try images under 5MB)

### Rate Limiting

The scripts include 1-second delays between requests. If you still hit rate limits:

- Test one model at a time using `--model`
- Increase the delay in the script
- Check with your API administrator

## Integration with Your App

The test scripts use the same format as your app's `claudeService.ts`:

```typescript
// From claudeService.ts:10-81
const request = {
  model: 'Claude-Sonnet-4',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this image...' },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ]
    }
  ],
  max_tokens: 200,
  temperature: 0.3,
};
```

## What These Tests Do NOT Cover

❌ **Image Generation** - The Midas completions endpoint does not support generating images from text prompts. For image generation, you would need:
- A different API endpoint (not `/llm/completions`)
- Image generation models like DALL-E, Stable Diffusion, or Flux

## Next Steps

After verifying vision capabilities:

1. ✅ Test with your own photos to see analysis quality
2. ✅ Compare responses between models
3. ✅ Check token usage and cost estimates
4. ✅ Test with different image types (photos, diagrams, screenshots)
5. ✅ Integrate successful formats into your app

## Related Files

- `src/services/azure/claudeService.ts` - Production vision implementation
- `src/services/imageService.ts` - Image processing utilities
- `scripts/test-models.ts` - General model testing
- `scripts/model-configs.json` - Model configuration
