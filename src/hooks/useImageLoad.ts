// @ts-nocheck
import { useEffect, useState } from 'react';

/**
 * Custom hook to load images
 * Replacement for use-image to avoid React 19 compatibility issues
 */
export function useImageLoad(src: string): [HTMLImageElement | undefined, 'loading' | 'loaded' | 'failed'] {
  const [image, setImage] = useState<HTMLImageElement>();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      setImage(img);
      setStatus('loaded');
    };

    const handleError = () => {
      setStatus('failed');
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = src;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  return [image, status];
}
