# Quick Start Guide - Midas API Model Testing

## 30-Second Start (No API Key Needed)

```bash
# Validate all configurations
python scripts/test-models.py --check

# See what would be tested
python scripts/test-models.py --dry-run
```

## Files Overview

```
scripts/
├── model-configs.json        # 17 models with proper payloads
├── test-models.py           # Python test script (enhanced)
├── test-models.ts           # TypeScript test script
├── requirements.txt         # Python dependencies
├── README.md                # Full documentation
├── PAYLOAD_REFERENCE.md     # Payload format guide
├── TESTING_SUMMARY.md       # Enhancement details
└── QUICK_START.md          # This file
```

## Three Modes

### 1. Check Mode (Validate Configurations)
```bash
python scripts/test-models.py --check
```
- ✅ No API key needed
- ✅ Validates all 17 models
- ✅ Fast (<1 second)
- ✅ CI/CD friendly

### 2. Dry Run Mode (Preview Tests)
```bash
python scripts/test-models.py --dry-run
python scripts/test-models.py --dry-run --model "GPT 4o"
```
- ✅ No API key needed
- ✅ Shows what would be tested
- ✅ Displays model details
- ✅ Perfect for setup verification

### 3. Test Mode (Actual API Calls)
```bash
# Set API key first
export REACT_APP_AZURE_API_KEY="your-key"

# Run tests
python scripts/test-models.py
python scripts/test-models.py --model "GPT 4o"
python scripts/test-models.py --verbose
```
- ⚠️ Requires API key
- ⚠️ Makes actual API calls
- ⚠️ Takes several minutes

## Install Dependencies (Optional but Recommended)

```bash
pip install -r scripts/requirements.txt
```

**What it installs:**
- `requests` - HTTP library
- `python-dotenv` - .env file support
- `colorama` - Cross-platform colors

**Without dependencies:**
Script still works but shows a tip to install python-dotenv.

## Common Commands

```bash
# Quick validation (no API key)
python scripts/test-models.py --check

# Preview tests (no API key)
python scripts/test-models.py --dry-run

# Help
python scripts/test-models.py --help

# Test specific model (requires API key)
python scripts/test-models.py --model "GPT 4o"

# Verbose output (requires API key)
python scripts/test-models.py --verbose

# TypeScript version (requires API key and ts-node)
npx ts-node scripts/test-models.ts

# Jest tests (requires API key)
npm test -- api-models.test.ts
```

## API Key Setup (For Actual Tests)

### Option 1: .env File (Recommended)
```bash
# Create or edit .env.local
echo "REACT_APP_AZURE_API_KEY=your-key-here" >> .env.local

# Run tests
python scripts/test-models.py
```

### Option 2: Environment Variable
```bash
export REACT_APP_AZURE_API_KEY="your-key-here"
python scripts/test-models.py
```

### Option 3: Command Line
```bash
python scripts/test-models.py --api-key "your-key-here"
```

## Available Models (17 Total)

### GPT Models (6)
- GPT 4o, GPT 4o Mini
- GPT o1, GPT o3 Mini
- GPT 4.1, GPT 4.1 Mini

### Llama Models (1)
- Llama 3.1

### Gemini Models (8)
- Gemini 1.5/2.0/2.5 Flash, Pro, Lite
- OpenAI format variants

### Claude Models (2)
- Claude Sonnet 4
- Claude Sonnet 4 (OpenAI format)

## Endpoint

```
https://midas.ai.bosch.com/ss1/api/v2/llm/completions
```

## Payload Formats

### Standard Format
```json
{
  "deploymentName": "GPT 4o",
  "messages": [
    {
      "role": "system",
      "content": [{"type": "text", "text": "You are helpful"}]
    }
  ]
}
```

### OpenAI Format
```json
{
  "model": "Claude-Sonnet-4-openai",
  "messages": [
    {
      "role": "system",
      "content": "You are helpful"
    }
  ]
}
```

See `PAYLOAD_REFERENCE.md` for complete details.

## Expected Output

### Check Mode
```
Configuration Validation
========================
GPT Models:
  ✅ GPT 4o (GPT 4o)
  ✅ GPT 4o Mini (GPT 4o Mini)
  ...

Validation Summary
==================
Total models: 17
✅ Valid: 17
❌ Invalid: 0
```

### Dry Run Mode
```
Dry Run Mode - Configuration Test
==================================
GPT Models:
  ℹ️  Would test: GPT 4o (GPT 4o)
     Format: standard
     Deployment: GPT 4o
     Messages: 2 message(s)
```

### Test Mode (With API Key)
```
MIDAS API Model Availability Test
==================================
Testing GPT Models
==================
  Testing GPT 4o (GPT 4o)...
  ✅ GPT 4o - 1234ms

Test Summary
============
Total tests: 17
✅ Successful: 15
❌ Failed: 2
Success rate: 88.2%

📝 Results saved to: scripts/test-results-python.json
```

## Troubleshooting

### "No API key provided"
- Use `--check` or `--dry-run` mode (no API key needed)
- Or set `REACT_APP_AZURE_API_KEY` environment variable

### "requests module not found"
```bash
pip install requests
# Or install all dependencies
pip install -r scripts/requirements.txt
```

### "python-dotenv not found"
- Script still works, just shows a tip
- Install for .env file support: `pip install python-dotenv`

### "Configuration invalid"
- Run `python scripts/test-models.py --check` to see details
- Fix issues in `scripts/model-configs.json`

## Next Steps

1. **Validate Setup** ✅
   ```bash
   python scripts/test-models.py --check
   ```

2. **Preview Tests** ✅
   ```bash
   python scripts/test-models.py --dry-run
   ```

3. **Get API Key** (From Midas administrator)

4. **Run Actual Tests**
   ```bash
   export REACT_APP_AZURE_API_KEY="your-key"
   python scripts/test-models.py
   ```

## Documentation Files

- **Full docs:** `scripts/README.md`
- **Payload formats:** `scripts/PAYLOAD_REFERENCE.md`
- **Enhancements:** `scripts/TESTING_SUMMARY.md`
- **This guide:** `scripts/QUICK_START.md`

## Support

- Check configuration: `python scripts/test-models.py --check`
- Read documentation: `scripts/README.md`
- View payload examples: `scripts/PAYLOAD_REFERENCE.md`
- Review test results: `scripts/test-results-python.json`

---

**Last Updated:** 2026-02-01
**Status:** ✅ All configurations valid and ready to test
