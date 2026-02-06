#!/usr/bin/env python3
"""
Detailed vision test with actual image description
"""

import json
import base64
import requests
from PIL import Image, ImageDraw, ImageFont
import io

# Disable SSL warnings
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ENDPOINT = "https://midas.ai.bosch.com/ss1/api/v2/llm/completions"

def create_text_image():
    """Create an image with clear text: 'HELLO WORLD'"""
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)

    # Draw large text
    try:
        # Try to use a font, fallback to default if not available
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
    except:
        font = ImageFont.load_default()

    # Draw text in black
    draw.text((50, 70), "HELLO WORLD", fill='black', font=font)

    # Draw a big red circle
    draw.ellipse([20, 20, 80, 80], fill='red', outline='black', width=3)

    # Draw a blue rectangle
    draw.rectangle([320, 120, 380, 180], fill='blue', outline='black', width=3)

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def test_vision_with_details(model_name, base64_image):
    """Test vision with detailed prompt"""
    print(f"\n{'='*70}")
    print(f"Testing: {model_name}")
    print('='*70)

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Describe this image in detail. What text, shapes, and colors do you see?"
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
        "max_tokens": 200,
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
            print(f"\nFull Response:")
            print(json.dumps(response_data, indent=2))

            # Midas API wraps response in data object
            data = response_data.get('data', response_data)
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            print(f"\n✅ Content: '{content}'")
            print(f"Content length: {len(content)} characters")

            if content and len(content.strip()) > 0:
                return True, content
            else:
                return False, "Empty response content"
        else:
            error_data = response.json() if response.text else {}
            print(f"\nError Response:")
            print(json.dumps(error_data, indent=2))
            return False, error_data.get('error', {}).get('message', 'Unknown error')

    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, str(e)

def test_text_only_baseline(model_name):
    """Test without image to verify model works"""
    print(f"\n{'='*70}")
    print(f"Baseline Test (No Image): {model_name}")
    print('='*70)

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": "Say 'Hello! I am working.' in exactly those words."
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

        if response.status_code == 200:
            response_data = response.json()
            # Midas API wraps response in data object
            data = response_data.get('data', response_data)
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            print(f"✅ Response: '{content}'")
            return True, content
        else:
            print(f"❌ Failed: {response.status_code}")
            return False, "Failed"

    except Exception as e:
        print(f"❌ Exception: {e}")
        return False, str(e)

def main():
    print("\n" + "="*70)
    print("DETAILED VISION SUPPORT TEST")
    print("="*70)

    print("\nCreating test image with text 'HELLO WORLD' and shapes...")
    test_image = create_text_image()
    print(f"Image created: {len(test_image)} bytes (base64)")

    models = ["GPT 4o", "Claude-Sonnet-4", "Gemini-2.5-pro"]

    results = []

    for model in models:
        # First test without image (baseline)
        baseline_success, baseline_response = test_text_only_baseline(model)

        # Then test with image
        vision_success, vision_response = test_vision_with_details(model, test_image)

        results.append({
            'model': model,
            'baseline_works': baseline_success,
            'baseline_response': baseline_response,
            'vision_works': vision_success,
            'vision_response': vision_response
        })

    # Summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)

    for r in results:
        print(f"\n{r['model']}:")
        print(f"  Baseline (text-only): {'✅' if r['baseline_works'] else '❌'}")
        print(f"    Response: {r['baseline_response'][:100]}")
        print(f"  Vision (with image): {'✅' if r['vision_works'] else '❌'}")
        print(f"    Response: {r['vision_response'][:100]}")

    # Save results
    with open('scripts/vision-test-detailed.json', 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\n📝 Results saved to: scripts/vision-test-detailed.json\n")

if __name__ == '__main__':
    main()
