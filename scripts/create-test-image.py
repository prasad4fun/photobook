#!/usr/bin/env python3
"""
Create a simple test image (PNG) for vision testing

Usage:
    python scripts/create-test-image.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_test_image():
    """Create a simple test pattern as PNG"""
    # Create a 400x300 image
    width, height = 400, 300
    image = Image.new('RGB', (width, height), color='#f0f0f0')
    draw = ImageDraw.Draw(image)

    # Draw colored rectangles
    colors = [
        ('#FF6B6B', (50, 50, 130, 130)),      # Red
        ('#4ECDC4', (160, 50, 240, 130)),     # Turquoise
        ('#45B7D1', (270, 50, 350, 130)),     # Light blue
        ('#FFA07A', (105, 160, 185, 240)),    # Light salmon
        ('#98D8C8', (215, 160, 295, 240)),    # Light green
    ]

    # Draw rectangles with borders
    for color, coords in colors:
        draw.rectangle(coords, fill=color, outline='#000000', width=2)

    # Draw text at the top
    try:
        # Try to use a nice font, fallback to default
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        font = ImageFont.load_default()

    text = "Test Pattern"
    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_x = (width - text_width) // 2

    draw.text((text_x, 20), text, fill='#333333', font=font)

    # Save the image
    output_path = os.path.join(os.path.dirname(__file__), 'test-pattern.png')
    image.save(output_path, 'PNG')

    print(f"✅ Test image created: {output_path}")
    print(f"   Size: {width}x{height} pixels")
    print(f"   Format: PNG")
    print(f"\nYou can now test with:")
    print(f"  python scripts/test-vision-analysis.py --image {output_path} --no-verify-ssl")

if __name__ == "__main__":
    try:
        create_test_image()
    except Exception as e:
        print(f"❌ Error creating test image: {e}")
        print("\nMake sure PIL/Pillow is installed:")
        print("  pip install Pillow")
