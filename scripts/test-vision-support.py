#!/usr/bin/env python3
"""
Test vision/image support on Midas API models
Tests if models accept base64 image inputs
"""

import json
import base64
import requests
from PIL import Image
import io

# Disable SSL warnings for internal Bosch API
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Midas API endpoint
ENDPOINT = "https://midas.ai.bosch.com/ss1/api/v2/llm/completions"

# Create a simple test image (1x1 red pixel)
def create_test_image():
    """Create a simple 100x100 red square image"""
    img = Image.new('RGB', (100, 100), color='red')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_bytes = buffer.getvalue()
    return base64.b64encode(img_bytes).decode('utf-8')

# Test models that typically support vision
VISION_MODELS = [
    {
        "name": "GPT 4o",
        "model": "GPT 4o",
        "format": "openai",
        "supports_vision": True
    },
    {
        "name": "GPT 4o Mini",
        "model": "GPT 4o Mini",
        "format": "openai",
        "supports_vision": True
    },
    {
        "name": "Claude Sonnet 4",
        "model": "Claude-Sonnet-4",
        "format": "openai",
        "supports_vision": True
    },
    {
        "name": "Gemini 2.5 Pro",
        "model": "Gemini-2.5-pro",
        "format": "openai",
        "supports_vision": True
    },
    {
        "name": "Gemini 2.0 Flash",
        "model": "Gemini-2.0-flash",
        "format": "openai",
        "supports_vision": True
    }
]

def test_vision_openai_format(model_name, base64_image):
    """Test vision with OpenAI format - single content string with image_url"""
    print(f"\n{'='*70}")
    print(f"Testing: {model_name}")
    print(f"Format: OpenAI with image_url (GPT-4 Vision style)")
    print('='*70)

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What color is this image? Answer in one word."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 50,
        "temperature": 0.1
    }

    try:
        response = requests.post(
            ENDPOINT,
            headers={"Content-Type": "application/json"},
            json=payload,
            verify=False,
            timeout=30
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            response_data = response.json()
            # Midas API wraps response in data object
            data = response_data.get('data', response_data)
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            print(f"✅ SUCCESS - Response: {content}")
            return True, content
        else:
            error_data = response.json() if response.text else {}
            error_msg = error_data.get('error', {}).get('message') or error_data.get('message') or 'Unknown error'
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"   Error: {error_msg}")
            return False, error_msg

    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, str(e)

def test_vision_anthropic_format(model_name, base64_image):
    """Test vision with Anthropic/Claude format - base64 in source"""
    print(f"\n{'='*70}")
    print(f"Testing: {model_name}")
    print(f"Format: Anthropic with image source (Claude style)")
    print('='*70)

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": base64_image
                        }
                    },
                    {
                        "type": "text",
                        "text": "What color is this image? Answer in one word."
                    }
                ]
            }
        ],
        "max_tokens": 50,
        "temperature": 0.1
    }

    try:
        response = requests.post(
            ENDPOINT,
            headers={"Content-Type": "application/json"},
            json=payload,
            verify=False,
            timeout=30
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            response_data = response.json()
            # Midas API wraps response in data object
            data = response_data.get('data', response_data)
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            print(f"✅ SUCCESS - Response: {content}")
            return True, content
        else:
            error_data = response.json() if response.text else {}
            error_msg = error_data.get('error', {}).get('message') or error_data.get('message') or 'Unknown error'
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"   Error: {error_msg}")
            return False, error_msg

    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, str(e)

def main():
    print("\n" + "="*70)
    print("MIDAS API VISION SUPPORT TEST")
    print("="*70)
    print("\nCreating test image (100x100 red square)...")

    test_image = create_test_image()
    print(f"Image created: {len(test_image)} bytes (base64)")

    results = []

    for model_config in VISION_MODELS:
        # Test OpenAI format (GPT-4 Vision style)
        success1, response1 = test_vision_openai_format(
            model_config['model'],
            test_image
        )

        results.append({
            'model': model_config['name'],
            'format': 'OpenAI (image_url)',
            'success': success1,
            'response': response1
        })

        # Test Anthropic format (Claude style)
        success2, response2 = test_vision_anthropic_format(
            model_config['model'],
            test_image
        )

        results.append({
            'model': model_config['name'],
            'format': 'Anthropic (image source)',
            'success': success2,
            'response': response2
        })

    # Summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)

    success_count = sum(1 for r in results if r['success'])
    total_count = len(results)

    print(f"\nTotal tests: {total_count}")
    print(f"✅ Successful: {success_count}")
    print(f"❌ Failed: {total_count - success_count}")
    print(f"Success rate: {(success_count/total_count*100):.1f}%\n")

    print("Working Combinations:")
    for r in results:
        if r['success']:
            print(f"  ✅ {r['model']} - {r['format']}")
            print(f"     Response: {r['response'][:100]}")

    print("\nFailed Combinations:")
    for r in results:
        if not r['success']:
            print(f"  ❌ {r['model']} - {r['format']}")
            print(f"     Error: {r['response'][:100]}")

    # Save results
    with open('scripts/vision-test-results.json', 'w') as f:
        json.dump({
            'timestamp': str(pd.Timestamp.now()) if 'pd' in dir() else 'N/A',
            'test_image_size': len(test_image),
            'results': results
        }, f, indent=2)

    print(f"\n📝 Results saved to: scripts/vision-test-results.json\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
