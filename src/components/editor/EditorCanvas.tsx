import { useEffect, useRef, useState } from 'react';
import { ImageLayerProps } from '../../types';
import { useImageLoad } from '../../hooks/useImageLoad';

interface EditorCanvasProps {
  imageUrl: string;
  adjustments: ImageLayerProps;
  width: number;
  height: number;
  onImageLoad?: () => void;
}

export default function EditorCanvas({
  imageUrl,
  adjustments,
  width,
  height,
  onImageLoad,
}: EditorCanvasProps) {
  const [image] = useImageLoad(imageUrl);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, x: 0, y: 0 });

  // Calculate image dimensions to fit canvas
  useEffect(() => {
    if (image) {
      const dims = fitImageToCanvas(image.width, image.height, width, height);
      setImageDimensions(dims);
      onImageLoad?.();
    }
  }, [image, width, height, onImageLoad]);

  // Draw image with adjustments
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply filters
    ctx.filter = buildCSSFilter(adjustments);

    // Draw image
    ctx.drawImage(
      image,
      imageDimensions.x,
      imageDimensions.y,
      imageDimensions.width,
      imageDimensions.height
    );

    // Reset filter
    ctx.filter = 'none';
  }, [image, adjustments, imageDimensions, width, height]);

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800">
      {/* Checkerboard pattern background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="relative z-10"
      />

      {/* Loading overlay */}
      {!image && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading image...</p>
          </div>
        </div>
      )}

      {/* Image info overlay */}
      {image && (
        <div className="absolute bottom-4 left-4 px-3 py-2 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs text-slate-400 font-mono z-20">
          {image.width} × {image.height}px
        </div>
      )}
    </div>
  );
}

// Helper functions
function fitImageToCanvas(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
): { width: number; height: number; x: number; y: number } {
  const imageAspect = imageWidth / imageHeight;
  const canvasAspect = canvasWidth / canvasHeight;

  let width: number;
  let height: number;

  if (imageAspect > canvasAspect) {
    width = canvasWidth;
    height = canvasWidth / imageAspect;
  } else {
    height = canvasHeight;
    width = canvasHeight * imageAspect;
  }

  const x = (canvasWidth - width) / 2;
  const y = (canvasHeight - height) / 2;

  return { width, height, x, y };
}

function buildCSSFilter(adjustments: ImageLayerProps): string {
  const filters: string[] = [];

  // Brightness
  if (adjustments.brightness !== 0) {
    const value = 100 + adjustments.brightness;
    filters.push(`brightness(${value}%)`);
  }

  // Contrast
  if (adjustments.contrast !== 0) {
    const value = 100 + adjustments.contrast;
    filters.push(`contrast(${value}%)`);
  }

  // Saturation
  if (adjustments.saturation !== 0) {
    const value = 100 + adjustments.saturation;
    filters.push(`saturate(${value}%)`);
  }

  // Hue
  if (adjustments.hue !== 0) {
    filters.push(`hue-rotate(${adjustments.hue}deg)`);
  }

  // Apply preset filters
  adjustments.filters.forEach((filter) => {
    switch (filter.type) {
      case 'bw':
        filters.push('grayscale(100%)');
        break;
      case 'sepia':
        filters.push(`sepia(${filter.intensity}%)`);
        break;
      case 'blur':
        filters.push(`blur(${(filter.intensity / 100) * 10}px)`);
        break;
      case 'vintage':
        filters.push(`sepia(40%) saturate(80%)`);
        break;
      case 'vignette':
        // Vignette requires more complex implementation
        break;
    }
  });

  return filters.length > 0 ? filters.join(' ') : 'none';
}
