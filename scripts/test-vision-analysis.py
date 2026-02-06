#!/usr/bin/env python3
"""
Vision/Image Analysis Test Script for Midas API (Python version)

Tests vision capabilities of Claude Sonnet-4, GPT-4o, and Gemini models

Usage:
    python scripts/test-vision-analysis.py --image path/to/image.jpg
    python scripts/test-vision-analysis.py --url https://example.com/image.jpg
    python scripts/test-vision-analysis.py --image photo.jpg --model "GPT 4o"
    python scripts/test-vision-analysis.py --generate-test-image
    python scripts/test-vision-analysis.py --image photo.jpg --verbose
"""

import os
import sys
import json
import base64
import time
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
import requests

# Configuration
ENDPOINT = "https://midas.ai.bosch.com/ss1/api/v2/llm/completions"
API_KEY = os.environ.get("REACT_APP_AZURE_API_KEY") or os.environ.get("MIDAS_API_KEY") or ""

# Models to test (vision-capable)
VISION_MODELS = [
    {"name": "Claude Sonnet-4", "deployment": "Claude-Sonnet-4"},
    {"name": "GPT 4o", "deployment": "GPT 4o"},
    {"name": "GPT 4.1", "deployment": "GPT 4.1"},
    {"name": "Gemini 2.5 Pro", "deployment": "Gemini-2.5-pro"},
    {"name": "Gemini 2.0 Flash", "deployment": "Gemini-2.0-flash"},
]

# ANSI color codes
class Colors:
    RESET = "\033[0m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    GRAY = "\033[90m"


def log(message: str, color: str = Colors.RESET):
    """Print colored message"""
    print(f"{color}{message}{Colors.RESET}")


def log_section(title: str):
    """Print section header"""
    print("\n" + "=" * 80)
    log(title, Colors.CYAN)
    print("=" * 80 + "\n")


def image_to_base64(image_path: str) -> str:
    """Convert image file to base64 string"""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
    except Exception as e:
        raise Exception(f"Failed to read image file: {e}")


def download_image_to_base64(url: str, verify_ssl: bool = True) -> str:
    """Download image from URL and convert to base64"""
    try:
        response = requests.get(url, timeout=30, verify=verify_ssl)
        response.raise_for_status()
        return base64.b64encode(response.content).decode("utf-8")
    except Exception as e:
        raise Exception(f"Failed to download image from URL: {e}")


def generate_test_image() -> str:
    """Generate a simple test image (SVG) as base64"""
    svg = """<?xml version="1.0" encoding="UTF-8"?>
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
</svg>"""
    return base64.b64encode(svg.encode("utf-8")).decode("utf-8")


def save_test_image(base64_data: str, output_path: str):
    """Save base64 image data to file"""
    with open(output_path, "wb") as f:
        f.write(base64.b64decode(base64_data))
    log(f"✅ Test image saved to: {output_path}", Colors.GREEN)


def test_vision_model(
    model: Dict[str, str],
    image_base64: str,
    image_type: str = "jpeg",
    api_key: str = "",
    verbose: bool = False,
    verify_ssl: bool = True,
) -> Dict[str, Any]:
    """Test vision analysis with a single model"""
    start_time = time.time()

    try:
        log(f"  Testing {model['name']}...", Colors.GRAY)

        # Prepare the vision request (OpenAI format)
        request = {
            "model": model["deployment"],
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Analyze this image in detail. Describe:
1. What you see in the image (objects, people, scene)
2. Colors and composition
3. Lighting conditions
4. Overall mood or atmosphere
5. Any text visible in the image

Be specific and detailed.""",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/{image_type};base64,{image_base64}",
                                "detail": "high",
                            },
                        },
                    ],
                }
            ],
            "max_tokens": 500,
            "temperature": 0.3,
        }

        headers = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        response = requests.post(ENDPOINT, headers=headers, json=request, timeout=60, verify=verify_ssl)
        response_time = (time.time() - start_time) * 1000  # Convert to ms

        if not response.ok:
            error_data = response.json()
            return {
                "model": model["name"],
                "success": False,
                "response_time": response_time,
                "status_code": response.status_code,
                "error": error_data.get("error", {}).get("message")
                or error_data.get("message")
                or str(error_data),
            }

        data = response.json()

        # Handle both wrapped and unwrapped responses
        wrapped_data = data.get("data", data)
        content = wrapped_data.get("choices", [{}])[0].get("message", {}).get("content", "")
        tokens_used = wrapped_data.get("usage", {}).get("total_tokens")

        return {
            "model": model["name"],
            "success": True,
            "response_time": response_time,
            "status_code": response.status_code,
            "response": content,
            "tokens_used": tokens_used,
        }

    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        return {
            "model": model["name"],
            "success": False,
            "response_time": response_time,
            "error": str(e),
        }


def main():
    """Main test function"""
    parser = argparse.ArgumentParser(description="Test Midas API vision capabilities")
    parser.add_argument("--image", help="Path to local image file")
    parser.add_argument("--url", help="URL to image file")
    parser.add_argument("--model", help="Test specific model only")
    parser.add_argument("--api-key", help="Midas API key (optional)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show full responses")
    parser.add_argument("--generate-test-image", action="store_true", help="Generate test pattern")
    parser.add_argument("--no-verify-ssl", action="store_true", help="Disable SSL verification (for corporate APIs)")

    args = parser.parse_args()

    log_section("🔍 Midas API Vision/Image Analysis Test")

    # Handle test image generation
    if args.generate_test_image:
        log_section("Generating Test Image")
        test_image_base64 = generate_test_image()
        output_path = Path(__file__).parent / "test-pattern.svg"
        save_test_image(test_image_base64, str(output_path))
        log("\nYou can now test with this image:", Colors.YELLOW)
        log(f"  python scripts/test-vision-analysis.py --image {output_path}", Colors.CYAN)
        return

    # Validate inputs
    if not args.image and not args.url:
        log("❌ Error: No image source provided!", Colors.RED)
        log("\nUsage:", Colors.YELLOW)
        log("  --image path/to/image.jpg    Load image from file", Colors.CYAN)
        log("  --url https://example.com/image.jpg    Load image from URL", Colors.CYAN)
        log("  --generate-test-image         Generate a test pattern SVG", Colors.CYAN)
        log('  --model "GPT 4o"             Test specific model only', Colors.CYAN)
        log("  --verbose                     Show full responses", Colors.CYAN)
        sys.exit(1)

    # Load image
    image_base64: str
    image_type = "jpeg"

    try:
        if args.image:
            log(f"Loading image from file: {args.image}", Colors.GRAY)
            image_base64 = image_to_base64(args.image)

            # Detect image type from extension
            ext = Path(args.image).suffix.lower()
            if ext == ".png":
                image_type = "png"
            elif ext == ".gif":
                image_type = "gif"
            elif ext == ".webp":
                image_type = "webp"
            elif ext == ".svg":
                image_type = "svg+xml"

            file_size_kb = len(base64.b64decode(image_base64)) // 1024
            log(f"✅ Image loaded: {file_size_kb} KB ({image_type})", Colors.GREEN)

        elif args.url:
            log(f"Downloading image from URL: {args.url}", Colors.GRAY)
            image_base64 = download_image_to_base64(args.url, verify_ssl=not args.no_verify_ssl)
            file_size_kb = len(base64.b64decode(image_base64)) // 1024
            log(f"✅ Image downloaded: {file_size_kb} KB", Colors.GREEN)

    except Exception as e:
        log(f"❌ Failed to load image: {e}", Colors.RED)
        sys.exit(1)

    # Filter models if specific model requested
    models_to_test = VISION_MODELS
    if args.model:
        models_to_test = [
            m for m in VISION_MODELS if m["name"] == args.model or m["deployment"] == args.model
        ]
        if not models_to_test:
            log(f"❌ Model not found: {args.model}", Colors.RED)
            log("Available models:", Colors.YELLOW)
            for m in VISION_MODELS:
                log(f"  - {m['name']}", Colors.CYAN)
            sys.exit(1)

    # Get API key
    api_key = args.api_key or API_KEY

    # Run tests
    log_section("Running Vision Analysis Tests")
    results: List[Dict[str, Any]] = []
    success_count = 0
    fail_count = 0

    # Disable SSL warnings if --no-verify-ssl is used
    if args.no_verify_ssl:
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        log("⚠️  SSL verification disabled", Colors.YELLOW)

    for model in models_to_test:
        result = test_vision_model(
            model, image_base64, image_type, api_key, args.verbose, verify_ssl=not args.no_verify_ssl
        )
        results.append(result)

        if result["success"]:
            success_count += 1
            log(f"  ✅ {result['model']} - {result['response_time']:.0f}ms", Colors.GREEN)
            if result.get("tokens_used"):
                log(f"     Tokens used: {result['tokens_used']}", Colors.GRAY)
            if args.verbose and result.get("response"):
                log(f"\n     Response:", Colors.CYAN)
                response_text = result["response"][:500]
                if len(result["response"]) > 500:
                    response_text += "..."
                log(f"     {response_text}", Colors.GRAY)
                log("", Colors.RESET)
        else:
            fail_count += 1
            log(f"  ❌ {result['model']} - {result['response_time']:.0f}ms", Colors.RED)
            if result.get("status_code"):
                log(f"     Status: {result['status_code']}", Colors.RED)
            if result.get("error"):
                log(f"     Error: {result['error'][:200]}", Colors.RED)

        # Small delay to avoid rate limiting
        time.sleep(1)

    # Summary
    log_section("Test Summary")
    log(f"Total tests: {len(results)}", Colors.CYAN)
    log(f"✅ Successful: {success_count}", Colors.GREEN)
    log(f"❌ Failed: {fail_count}", Colors.RED)
    if results:
        success_rate = (success_count / len(results)) * 100
        log(f"Success rate: {success_rate:.1f}%", Colors.CYAN)

    # Average response time for successful tests
    successful_results = [r for r in results if r["success"]]
    if successful_results:
        avg_time = sum(r["response_time"] for r in successful_results) / len(successful_results)
        log(f"Average response time: {avg_time:.0f}ms", Colors.CYAN)

    # Save results to file
    results_path = Path(__file__).parent / "vision-test-results.json"
    with open(results_path, "w") as f:
        json.dump(
            {
                "timestamp": datetime.now().isoformat(),
                "image_source": args.image or args.url,
                "image_type": image_type,
                "total_tests": len(results),
                "success_count": success_count,
                "fail_count": fail_count,
                "results": [
                    {
                        **r,
                        # Truncate response in saved file for readability
                        "response": r.get("response", "")[:500] if r.get("response") else None,
                    }
                    for r in results
                ],
            },
            f,
            indent=2,
        )
    log(f"\n📝 Results saved to: {results_path}", Colors.BLUE)

    # Show sample responses if not in verbose mode
    if not args.verbose and success_count > 0:
        log_section("Sample Responses (first 200 chars each)")
        for r in results:
            if r["success"] and r.get("response"):
                log(f"\n{r['model']}:", Colors.CYAN)
                log(r["response"][:200] + "...", Colors.GRAY)
        log("\n💡 Use --verbose flag to see full responses", Colors.YELLOW)

    print("\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log("Fatal error:", Colors.RED)
        print(str(e))
        sys.exit(1)
