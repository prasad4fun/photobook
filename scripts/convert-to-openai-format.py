#!/usr/bin/env python3
"""Convert all model configs to OpenAI format"""

import json

def convert_to_openai_format(model_config):
    """Convert a model config from standard to OpenAI format"""
    new_config = model_config.copy()

    # Change format
    new_config['format'] = 'openai'

    # Update payload
    old_payload = model_config['samplePayload']
    new_payload = {
        'model': model_config['deploymentName'],
        'messages': []
    }

    # Convert messages
    for msg in old_payload.get('messages', []):
        new_msg = {'role': msg['role']}

        # Convert content from array to string
        content = msg.get('content', [])
        if isinstance(content, list) and len(content) > 0:
            # Extract text from first content item
            new_msg['content'] = content[0].get('text', '') if isinstance(content[0], dict) else str(content[0])
        elif isinstance(content, str):
            new_msg['content'] = content
        else:
            new_msg['content'] = ''

        new_payload['messages'].append(new_msg)

    # Copy other parameters (excluding top_p and deploymentName)
    for key in ['stream', 'temperature', 'max_tokens']:
        if key in old_payload:
            new_payload[key] = old_payload[key]

    new_config['samplePayload'] = new_payload

    return new_config

# Load config
with open('model-configs.json', 'r') as f:
    config = json.load(f)

# Convert all standard format models
for category in config['models']:
    new_models = []
    for model in config['models'][category]:
        if model['format'] == 'standard':
            print(f"Converting {model['name']} to OpenAI format...")
            new_models.append(convert_to_openai_format(model))
        else:
            new_models.append(model)
    config['models'][category] = new_models

# Save updated config
with open('model-configs-openai.json', 'w') as f:
    json.dump(config, f, indent=2)

print("\n✅ Converted config saved to model-configs-openai.json")
print("   Review the file and replace model-configs.json if correct")
