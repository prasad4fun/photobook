#!/usr/bin/env python3
"""
Standalone Python script to test all available models on Midas API

Usage:
    python scripts/test-models.py
    python scripts/test-models.py --api-key YOUR_API_KEY
    python scripts/test-models.py --model "GPT 4o"
    python scripts/test-models.py --verbose
    python scripts/test-models.py --dry-run
    python scripts/test-models.py --check
"""

import json
import os
import sys
import time
import argparse
from typing import Dict, List, Optional, Any
from datetime import datetime
import requests

# Try to load .env file support
try:
    from dotenv import load_dotenv
    load_dotenv()
    ENV_SUPPORT = True
except ImportError:
    ENV_SUPPORT = False

# ANSI color codes
class Colors:
    RESET = '\033[0m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    GRAY = '\033[90m'

def log(message: str, color: str = Colors.RESET):
    """Print colored message"""
    print(f"{color}{message}{Colors.RESET}")

def log_section(title: str):
    """Print section header"""
    print("\n" + "=" * 80)
    log(title, Colors.CYAN)
    print("=" * 80 + "\n")

def load_config() -> Dict[str, Any]:
    """Load model configuration from JSON file"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, 'model-configs.json')

    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        log(f"Error loading config from {config_path}:", Colors.RED)
        print(str(e))
        sys.exit(1)

def validate_payload(model: Dict[str, Any]) -> Dict[str, Any]:
    """Validate model payload structure"""
    issues = []
    warnings = []

    # Check required fields
    required_fields = ['name', 'deploymentName', 'format', 'samplePayload']
    for field in required_fields:
        if field not in model:
            issues.append(f"Missing required field: {field}")

    if 'samplePayload' in model:
        payload = model['samplePayload']

        # Check format-specific requirements
        if model.get('format') == 'openai':
            if 'model' not in payload:
                issues.append("OpenAI format requires 'model' field")
            if 'deploymentName' in payload:
                warnings.append("OpenAI format should not have 'deploymentName'")
        else:  # standard format
            if 'deploymentName' not in payload:
                issues.append("Standard format requires 'deploymentName' field")
            if 'model' in payload:
                warnings.append("Standard format should not have 'model' field")

        # Check messages structure
        if 'messages' not in payload:
            issues.append("Missing 'messages' field in payload")
        elif not isinstance(payload['messages'], list):
            issues.append("'messages' must be an array")
        else:
            for i, msg in enumerate(payload['messages']):
                if 'role' not in msg:
                    issues.append(f"Message {i} missing 'role' field")
                if 'content' not in msg:
                    issues.append(f"Message {i} missing 'content' field")

                # Check content structure based on format
                if 'content' in msg:
                    content = msg['content']
                    if model.get('format') == 'openai':
                        if not isinstance(content, str):
                            issues.append(f"Message {i}: OpenAI format content must be string")
                    else:
                        if not isinstance(content, list):
                            issues.append(f"Message {i}: Standard format content must be array")

    return {
        'valid': len(issues) == 0,
        'issues': issues,
        'warnings': warnings
    }

def check_configuration(config: Dict[str, Any]):
    """Check and validate all model configurations"""
    log_section('Configuration Validation')

    log(f"Endpoint: {config['endpoint']}", Colors.GRAY)
    log(f"Total model families: {len(config['models'])}", Colors.GRAY)

    total_models = 0
    valid_models = 0
    invalid_models = 0

    for category, models in config['models'].items():
        log(f"\n{category.upper()} Models:", Colors.CYAN)

        for model in models:
            total_models += 1
            validation = validate_payload(model)

            if validation['valid']:
                valid_models += 1
                log(f"  ✅ {model['name']} ({model['deploymentName']})", Colors.GREEN)

                if validation['warnings']:
                    for warning in validation['warnings']:
                        log(f"     ⚠️  {warning}", Colors.YELLOW)
            else:
                invalid_models += 1
                log(f"  ❌ {model['name']} ({model['deploymentName']})", Colors.RED)

                for issue in validation['issues']:
                    log(f"     - {issue}", Colors.RED)

    log_section('Validation Summary')
    log(f"Total models: {total_models}", Colors.CYAN)
    log(f"✅ Valid: {valid_models}", Colors.GREEN)
    log(f"❌ Invalid: {invalid_models}", Colors.RED)

    if invalid_models > 0:
        log("\n⚠️  Some models have configuration issues!", Colors.YELLOW)
        return False

    log("\n✅ All model configurations are valid!", Colors.GREEN)
    return True

def dry_run_test(config: Dict[str, Any], specific_model: Optional[str] = None):
    """Perform a dry run without making actual API calls"""
    log_section('Dry Run Mode - Configuration Test')

    log("This mode validates configurations without making API calls", Colors.YELLOW)
    log(f"Endpoint: {config['endpoint']}", Colors.GRAY)

    total_tests = 0

    for category, models in config['models'].items():
        log(f"\n{category.upper()} Models:", Colors.CYAN)

        for model in models:
            if specific_model and \
               model['name'] != specific_model and \
               model['deploymentName'] != specific_model:
                continue

            total_tests += 1
            log(f"  ℹ️  Would test: {model['name']} ({model['deploymentName']})", Colors.BLUE)
            log(f"     Format: {model['format']}", Colors.GRAY)

            payload = model['samplePayload']
            if model['format'] == 'openai':
                log(f"     Model: {payload.get('model', 'N/A')}", Colors.GRAY)
            else:
                log(f"     Deployment: {payload.get('deploymentName', 'N/A')}", Colors.GRAY)

            log(f"     Messages: {len(payload.get('messages', []))} message(s)", Colors.GRAY)

            if model.get('note'):
                log(f"     Note: {model['note']}", Colors.YELLOW)

    log_section('Dry Run Summary')
    log(f"Total models to test: {total_tests}", Colors.CYAN)
    log("\nTo run actual tests, remove the --dry-run flag", Colors.YELLOW)

def test_model(
    endpoint: str,
    api_key: Optional[str],
    model: Dict[str, Any],
    verbose: bool = False,
    verify_ssl: bool = True
) -> Dict[str, Any]:
    """Test a single model"""
    start_time = time.time()

    try:
        log(f"  Testing {model['name']} ({model['deploymentName']})...", Colors.GRAY)

        headers = {
            'Content-Type': 'application/json'
        }

        # Add Authorization header only if API key is provided
        if api_key:
            headers['Authorization'] = f'Bearer {api_key}'

        response = requests.post(
            endpoint,
            headers=headers,
            json=model['samplePayload'],
            timeout=30,
            verify=verify_ssl
        )

        response_time = int((time.time() - start_time) * 1000)

        if response.status_code != 200:
            error_data = response.json() if response.text else {}
            error_msg = error_data.get('error', {}).get('message') or \
                       error_data.get('message') or \
                       'Unknown error'

            result = {
                'model': model['name'],
                'deploymentName': model['deploymentName'],
                'format': model['format'],
                'success': False,
                'responseTime': response_time,
                'statusCode': response.status_code,
                'error': error_msg
            }

            # Include full error response in verbose mode
            if verbose:
                result['errorDetails'] = error_data

            return result

        data = response.json()

        # Extract response text based on format
        response_text = ''
        if model['format'] == 'openai':
            response_text = data.get('choices', [{}])[0].get('message', {}).get('content', '')
        else:
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            if isinstance(content, list):
                response_text = content[0].get('text', '') if content else ''
            elif isinstance(content, str):
                response_text = content

        result = {
            'model': model['name'],
            'deploymentName': model['deploymentName'],
            'format': model['format'],
            'success': True,
            'responseTime': response_time,
            'statusCode': response.status_code,
            'response': response_text
        }

        if verbose and response_text:
            result['fullResponse'] = data

        return result

    except requests.exceptions.RequestException as e:
        response_time = int((time.time() - start_time) * 1000)
        return {
            'model': model['name'],
            'deploymentName': model['deploymentName'],
            'format': model['format'],
            'success': False,
            'responseTime': response_time,
            'error': str(e)
        }

def test_all_models(
    api_key: Optional[str],
    specific_model: Optional[str] = None,
    verbose: bool = False,
    verify_ssl: bool = True
):
    """Test all available models"""
    log_section('MIDAS API Model Availability Test')

    if api_key:
        log(f"API Key: {api_key[:10]}...", Colors.GRAY)
    else:
        log("No API key provided (testing without authentication)", Colors.YELLOW)

    config = load_config()
    log(f"Endpoint: {config['endpoint']}", Colors.GRAY)
    log(f"Verbose mode: {'ON' if verbose else 'OFF'}", Colors.GRAY)

    if not verify_ssl:
        log("⚠️  SSL verification disabled", Colors.YELLOW)
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    if specific_model:
        log(f"Testing specific model: {specific_model}", Colors.YELLOW)

    results: List[Dict[str, Any]] = []
    total_tests = 0
    success_count = 0
    fail_count = 0

    # Test each model category
    for category, models in config['models'].items():
        log_section(f'Testing {category.upper()} Models')

        for model in models:
            # Skip if specific model requested and this isn't it
            if specific_model and \
               model['name'] != specific_model and \
               model['deploymentName'] != specific_model:
                continue

            total_tests += 1
            result = test_model(config['endpoint'], api_key, model, verbose, verify_ssl)
            results.append(result)

            if result['success']:
                success_count += 1
                log(f"  ✅ {result['model']} - {result['responseTime']}ms", Colors.GREEN)
                if verbose and result.get('response'):
                    response_preview = result['response'][:100]
                    log(f"     Response: {response_preview}...", Colors.GRAY)
            else:
                fail_count += 1
                log(f"  ❌ {result['model']} - {result['responseTime']}ms", Colors.RED)
                if result.get('statusCode'):
                    log(f"     Status: {result['statusCode']}", Colors.RED)
                if result.get('error'):
                    error_preview = result['error'][:200]
                    log(f"     Error: {error_preview}", Colors.RED)

            if model.get('note'):
                log(f"     Note: {model['note']}", Colors.YELLOW)

            # Small delay to avoid rate limiting
            time.sleep(0.5)

    # Summary
    log_section('Test Summary')
    log(f"Total tests: {total_tests}", Colors.CYAN)
    log(f"✅ Successful: {success_count}", Colors.GREEN)
    log(f"❌ Failed: {fail_count}", Colors.RED)
    success_rate = (success_count / total_tests * 100) if total_tests > 0 else 0
    log(f"Success rate: {success_rate:.1f}%", Colors.CYAN)

    # Save results to file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    results_path = os.path.join(script_dir, 'test-results-python.json')

    output_data = {
        'timestamp': datetime.now().isoformat(),
        'totalTests': total_tests,
        'successCount': success_count,
        'failCount': fail_count,
        'results': results
    }

    with open(results_path, 'w') as f:
        json.dump(output_data, f, indent=2)

    log(f"\n📝 Results saved to: {results_path}", Colors.BLUE)

    # List working models
    if success_count > 0:
        log_section('Working Models')
        for r in results:
            if r['success']:
                log(f"  ✅ {r['model']} ({r['deploymentName']}) - {r['format']} format",
                    Colors.GREEN)

    # List failed models
    if fail_count > 0:
        log_section('Failed Models')
        for r in results:
            if not r['success']:
                log(f"  ❌ {r['model']} ({r['deploymentName']})", Colors.RED)
                if r.get('error'):
                    error_preview = r['error'][:100]
                    log(f"     {error_preview}", Colors.GRAY)

    print("\n")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Test Midas API model availability',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/test-models.py                      # Run all tests
  python scripts/test-models.py --no-verify-ssl      # Disable SSL verification
  python scripts/test-models.py --api-key YOUR_KEY   # With custom API key
  python scripts/test-models.py --model "GPT 4o"     # Test specific model
  python scripts/test-models.py --verbose            # Show detailed output
  python scripts/test-models.py --dry-run            # Validate config without API calls
  python scripts/test-models.py --check              # Check payload validity
        """
    )

    parser.add_argument(
        '--api-key',
        help='Midas API key (optional - some endpoints do not require authentication)',
        default=os.environ.get('REACT_APP_AZURE_API_KEY') or os.environ.get('MIDAS_API_KEY') or None
    )

    parser.add_argument(
        '--model',
        help='Test only a specific model by name or deployment name',
        default=None
    )

    parser.add_argument(
        '--verbose', '-v',
        help='Show verbose output including response previews',
        action='store_true'
    )

    parser.add_argument(
        '--dry-run',
        help='Validate configuration without making actual API calls',
        action='store_true'
    )

    parser.add_argument(
        '--check',
        help='Check payload validity for all models',
        action='store_true'
    )

    parser.add_argument(
        '--no-verify-ssl',
        help='Disable SSL certificate verification (use for internal/corporate APIs)',
        action='store_true'
    )

    args = parser.parse_args()

    # Show environment info
    if not ENV_SUPPORT and not args.dry_run and not args.check:
        log("ℹ️  Tip: Install python-dotenv for .env file support", Colors.YELLOW)
        log("   pip install python-dotenv\n", Colors.GRAY)

    try:
        config = load_config()

        # Check mode - validate payloads
        if args.check:
            success = check_configuration(config)
            sys.exit(0 if success else 1)

        # Dry run mode - show what would be tested
        if args.dry_run:
            dry_run_test(config, args.model)
            sys.exit(0)

        # Normal test mode
        test_all_models(
            api_key=args.api_key,
            specific_model=args.model,
            verbose=args.verbose,
            verify_ssl=not args.no_verify_ssl
        )
    except KeyboardInterrupt:
        log('\n\n⚠️  Tests interrupted by user', Colors.YELLOW)
        sys.exit(130)
    except Exception as e:
        log('\n❌ Fatal error:', Colors.RED)
        print(str(e))
        import traceback
        if args.verbose:
            traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
