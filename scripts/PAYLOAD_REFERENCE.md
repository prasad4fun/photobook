# Midas API Payload Reference Guide

Quick reference for the different payload formats used by various models on the Midas API.

## Table of Contents

- [Endpoint Information](#endpoint-information)
- [Authentication](#authentication)
- [Standard Format](#standard-format)
- [OpenAI Format](#openai-format)
- [Special Cases](#special-cases)
- [Response Formats](#response-formats)
- [Common Parameters](#common-parameters)

---

## Endpoint Information

**Base URL:**
```
https://midas.ai.bosch.com/ss1/api/v2/llm/completions
```

**Method:** `POST`

---

## Authentication

Include in headers:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

---

## Standard Format

Used by: **Most models** (GPT 4o, GPT 4.1, Llama 3.1, Gemini standard, Claude standard)

### Basic Request

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
          "text": "Hello, how are you?"
        }
      ]
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "top_p": 0.7,
  "max_tokens": 100
}
```

### With Image (Vision Models)

```json
{
  "deploymentName": "Claude-Sonnet-4",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "data": "iVBORw0KGgoAAAANS..."
          }
        },
        {
          "type": "text",
          "text": "What's in this image?"
        }
      ]
    }
  ],
  "max_tokens": 200,
  "temperature": 0.3
}
```

### Multi-turn Conversation

```json
{
  "deploymentName": "GPT 4.1",
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "You are a helpful coding assistant."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Write a hello world function in Python"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "def hello_world():\n    print('Hello, World!')"
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Now add error handling"
        }
      ]
    }
  ],
  "temperature": 0.5,
  "max_tokens": 300
}
```

---

## OpenAI Format

Used by: **OpenAI-compatible models** (Claude-Sonnet-4-openai, Gemini-*-openai)

### Basic Request

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
      "content": "Hello, how are you?"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 100
}
```

### Key Differences from Standard Format:

1. **Use `model` instead of `deploymentName`**
2. **Content is a string, not an array of objects**
3. **No `type` field in content**

### Multi-turn Conversation

```json
{
  "model": "Gemini-2.5-pro-openai",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful coding assistant."
    },
    {
      "role": "user",
      "content": "Write a hello world function"
    },
    {
      "role": "assistant",
      "content": "function helloWorld() { console.log('Hello, World!'); }"
    },
    {
      "role": "user",
      "content": "Add error handling"
    }
  ],
  "temperature": 0.5,
  "max_tokens": 300
}
```

---

## Special Cases

### GPT o1 / GPT o3 Models

These models have restrictions:

⚠️ **No system messages allowed**
⚠️ **No temperature parameter**
⚠️ **Only user/assistant messages**

```json
{
  "deploymentName": "GPT o1",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Solve this problem: What is 2+2?"
        }
      ]
    }
  ],
  "stream": false
}
```

### Streaming Responses

For streaming (works with most models):

```json
{
  "deploymentName": "GPT 4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Tell me a story"
        }
      ]
    }
  ],
  "stream": true,
  "temperature": 0.9,
  "max_tokens": 500
}
```

Handle the stream in your code:
```javascript
const response = await fetch(endpoint, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(payload)
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(line => line.trim());

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      // Process streaming data
    }
  }
}
```

---

## Response Formats

### Standard Format Response

```json
{
  "id": "chatcmpl-123456",
  "object": "chat.completion",
  "created": 1699999999,
  "model": "GPT 4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": [
          {
            "type": "text",
            "text": "Hello! I'm doing well, thank you for asking."
          }
        ]
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  }
}
```

### OpenAI Format Response

```json
{
  "id": "chatcmpl-123456",
  "object": "chat.completion",
  "created": 1699999999,
  "model": "Claude-Sonnet-4-openai",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  }
}
```

### Extracting Response Text

**Standard Format:**
```javascript
const content = data.choices[0].message.content;
const text = Array.isArray(content) ? content[0].text : content;
```

**OpenAI Format:**
```javascript
const text = data.choices[0].message.content;
```

---

## Common Parameters

### Required Parameters

| Parameter | Standard Format | OpenAI Format | Description |
|-----------|----------------|---------------|-------------|
| Model identifier | `deploymentName` | `model` | Name of the model/deployment |
| Messages | `messages` | `messages` | Array of conversation messages |

### Optional Parameters

| Parameter | Type | Default | Description | Models |
|-----------|------|---------|-------------|--------|
| `temperature` | float | 1.0 | Controls randomness (0-2) | Most (not o1/o3) |
| `top_p` | float | 1.0 | Nucleus sampling | GPT models |
| `max_tokens` | int | varies | Maximum tokens in response | All |
| `stream` | boolean | false | Enable streaming | All |
| `stop` | array | null | Stop sequences | All |
| `presence_penalty` | float | 0 | Penalize new topics (-2 to 2) | GPT models |
| `frequency_penalty` | float | 0 | Penalize repetition (-2 to 2) | GPT models |
| `n` | int | 1 | Number of completions | Most |

### Temperature Guidelines

```
0.0 - 0.3  : Deterministic, focused (good for factual tasks)
0.4 - 0.7  : Balanced creativity (good for general use)
0.8 - 1.2  : Creative (good for brainstorming, writing)
1.3 - 2.0  : Very creative (experimental, unpredictable)
```

---

## Model-Specific Examples

### GPT 4o - Document Analysis

```json
{
  "deploymentName": "GPT 4o",
  "messages": [
    {
      "role": "system",
      "content": [{"type": "text", "text": "You are a document analysis expert."}]
    },
    {
      "role": "user",
      "content": [{"type": "text", "text": "Analyze this quarterly report..."}]
    }
  ],
  "temperature": 0.3,
  "max_tokens": 1000
}
```

### Claude Sonnet 4 - Image Analysis

```json
{
  "deploymentName": "Claude-Sonnet-4",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "data": "base64_encoded_image_data"
          }
        },
        {
          "type": "text",
          "text": "Describe the lighting and mood of this photo."
        }
      ]
    }
  ],
  "max_tokens": 200,
  "temperature": 0.3
}
```

### Gemini 2.5 Pro - Code Generation

```json
{
  "deploymentName": "Gemini-2.5-pro",
  "messages": [
    {
      "role": "system",
      "content": [{"type": "text", "text": "You are an expert programmer."}]
    },
    {
      "role": "user",
      "content": [{"type": "text", "text": "Create a React component for..."}]
    }
  ],
  "temperature": 0.5,
  "max_tokens": 1500
}
```

### Llama 3.1 - Classification

```json
{
  "deploymentName": "Llama3.1",
  "messages": [
    {
      "role": "system",
      "content": [{"type": "text", "text": "Classify user queries as document-related or general."}]
    },
    {
      "role": "user",
      "content": [{"type": "text", "text": "What is AI?"}]
    }
  ],
  "temperature": 0.1,
  "max_tokens": 10
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "error": {
    "message": "Invalid authentication credentials",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

**404 Model Not Found:**
```json
{
  "error": {
    "message": "Model not found: invalid-model-name",
    "type": "invalid_request_error",
    "code": "model_not_found"
  }
}
```

**429 Rate Limit:**
```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded"
  }
}
```

**400 Bad Request:**
```json
{
  "error": {
    "message": "Invalid parameter: temperature must be between 0 and 2",
    "type": "invalid_request_error",
    "code": "invalid_parameter"
  }
}
```

### Error Handling Example

```javascript
try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`
    );
  }

  const data = await response.json();
  return data;

} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timeout');
  } else if (error.message.includes('429')) {
    console.error('Rate limit exceeded, retry after delay');
  } else {
    console.error('API request failed:', error);
  }
  throw error;
}
```

---

## Testing Checklist

When testing a new model, verify:

- [ ] Model name/deployment name is correct
- [ ] Payload format matches (standard vs OpenAI)
- [ ] System message support (not for o1/o3)
- [ ] Temperature parameter support
- [ ] Max tokens within limits
- [ ] Response parsing works correctly
- [ ] Error handling works
- [ ] Rate limits respected
- [ ] Authentication works

---

## Quick Command Reference

**Test all models (TypeScript):**
```bash
npx ts-node scripts/test-models.ts
```

**Test all models (Python):**
```bash
python scripts/test-models.py
```

**Test specific model:**
```bash
npx ts-node scripts/test-models.ts --model="GPT 4o"
python scripts/test-models.py --model="Claude Sonnet 4"
```

**Run Jest tests:**
```bash
npm test -- api-models.test.ts
```

---

## Additional Resources

- **Configuration:** `scripts/model-configs.json`
- **Full Documentation:** `scripts/README.md`
- **Test Script (TS):** `scripts/test-models.ts`
- **Test Script (Python):** `scripts/test-models.py`
- **Jest Tests:** `src/__tests__/api-models.test.ts`

---

**Last Updated:** 2026-02-01
