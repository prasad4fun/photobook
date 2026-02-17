/**
 * Photo Element Renderer - Renders photo elements with Konva Image
 */

import React, { useEffect, useState, useRef } from 'react';
import { Image, Group, Rect, Text, Line, Circle, Arrow } from 'react-konva';
import Konva from 'konva';
import { StudioPhotoElement } from '../../../../types';
import { usePhotoBookStore } from '../../../../hooks/usePhotoBookStore';
import { getPageDimensions } from '../../../../services/photobook-studio/photobookGenerator';

interface PhotoElementRendererProps {
  element: StudioPhotoElement;
  pageId: string;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onTransform: (attrs: Partial<StudioPhotoElement>) => void;
}

export default function PhotoElementRenderer({
  element,
  pageId,
  isSelected,
  onClick,
  onTransform,
}: PhotoElementRendererProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const imageRef = useRef<Konva.Image>(null);

  const photoBook = usePhotoBookStore((state) => state.photoBook);
  const selectedPhotos = usePhotoBookStore((state) => state.selectedPhotos);
  const updateElement = usePhotoBookStore((state) => state.updateElement);

  // Get page dimensions for percentage conversion
  const pageDimensions = photoBook
    ? getPageDimensions(photoBook.config)
    : { width: 2480, height: 3508 };

  // Find the photo
  const photo = selectedPhotos.find((p) => p.id === element.photoId);

  // Get effect properties early for useEffect dependency
  const effect = element.effect;

  // Load image
  useEffect(() => {
    if (!photo) return;

    const img = new window.Image();
    img.src = photo.url;
    img.onload = () => {
      setImage(img);
    };
  }, [photo?.url]);

  // Re-cache image when filters/effects change (must be before early return)
  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.cache();
      imageRef.current.getLayer()?.batchDraw();
    }
  }, [effect?.type, effect?.intensity]);

  // Convert percentage to pixels
  const x = (element.x / 100) * pageDimensions.width;
  const y = (element.y / 100) * pageDimensions.height;
  const width = (element.width / 100) * pageDimensions.width;
  const height = (element.height / 100) * pageDimensions.height;

  // Render placeholder if no photo assigned
  if (!element.photoId || !photo || !image) {
    const iconSize = Math.min(width, height) * 0.4; // 40% of smallest dimension
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const lineWidth = 8;

    // Handler for placeholder resize (same logic as photo resize)
    const handlePlaceholderTransformEnd = (e: any) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Convert scaled dimensions back to percentages
      const newWidth = (node.width() * scaleX / pageDimensions.width) * 100;
      const newHeight = (node.height() * scaleY / pageDimensions.height) * 100;
      const newX = (node.x() / pageDimensions.width) * 100;
      const newY = (node.y() / pageDimensions.height) * 100;

      // Update element with new dimensions
      onTransform({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        rotation: node.rotation(),
      });

      // Reset scale to 1 (standard Konva pattern)
      node.scaleX(1);
      node.scaleY(1);
    };

    return (
      <Group>
        {/* Placeholder box */}
        <Rect
          id={element.id}
          name="element"
          x={x}
          y={y}
          width={width}
          height={height}
          fill="#1e293b"
          stroke={isSelected ? '#8b5cf6' : '#475569'}
          strokeWidth={isSelected ? 4 : 2}
          dash={[20, 10]}
          rotation={element.rotation}
          draggable={!element.locked}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={(e) => {
            const node = e.target;
            onTransform({
              x: (node.x() / pageDimensions.width) * 100,
              y: (node.y() / pageDimensions.height) * 100,
            });
          }}
          onTransformEnd={handlePlaceholderTransformEnd}
          shadowColor={isSelected ? '#8b5cf6' : undefined}
          shadowBlur={isSelected ? 10 : 0}
          shadowOpacity={isSelected ? 0.8 : 0}
        />
        {/* Plus icon - vertical line */}
        <Line
          points={[centerX, centerY - iconSize / 2, centerX, centerY + iconSize / 2]}
          stroke="#64748b"
          strokeWidth={lineWidth}
          lineCap="round"
          listening={false}
        />
        {/* Plus icon - horizontal line */}
        <Line
          points={[centerX - iconSize / 2, centerY, centerX + iconSize / 2, centerY]}
          stroke="#64748b"
          strokeWidth={lineWidth}
          lineCap="round"
          listening={false}
        />
        {/* Label */}
        <Text
          x={x}
          y={y + height + 10}
          width={width}
          text="Drop photo here"
          fontSize={24}
          fontFamily="Arial"
          fill="#64748b"
          align="center"
          listening={false}
        />
      </Group>
    );
  }

  // Get transform properties (v2.0)
  const transform = element.transform || {
    zoom: 1,
    fit: 'cover',
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    panX: 0,
    panY: 0,
  };

  // Cover-fit crop calculation
  // The crop region must match the placeholder's aspect ratio (not the image's)
  // so Konva scales it without distortion to fill the placeholder exactly.
  const placeholderAspect = width / height;
  const imageAspect = image.width / image.height;

  // Base crop at zoom=1: largest region from image matching placeholder aspect ratio
  let baseCropW: number;
  let baseCropH: number;
  if (imageAspect > placeholderAspect) {
    // Image is wider: use full height, crop width to match placeholder aspect
    baseCropH = image.height;
    baseCropW = image.height * placeholderAspect;
  } else {
    // Image is taller: use full width, crop height to match placeholder aspect
    baseCropW = image.width;
    baseCropH = image.width / placeholderAspect;
  }

  // Apply user zoom (zoom=1 is cover fit, zoom>1 shows less of image)
  const cropWidth = baseCropW / transform.zoom;
  const cropHeight = baseCropH / transform.zoom;

  // Pan offset: shift crop region within available slack
  const slackX = Math.max(0, image.width - cropWidth);
  const slackY = Math.max(0, image.height - cropHeight);
  const panX = transform.panX || 0;
  const panY = transform.panY || 0;

  // cropX/cropY: center by default, shift by panX/panY within slack
  const cropX = Math.max(0, Math.min(slackX / 2 + panX * slackX, slackX));
  const cropY = Math.max(0, Math.min(slackY / 2 + panY * slackY, slackY));

  // Calculate scale for flip
  const scaleX = transform.flipHorizontal ? -1 : 1;
  const scaleY = transform.flipVertical ? -1 : 1;

  // Offset for flipped images
  const offsetX = transform.flipHorizontal ? width : 0;
  const offsetY = transform.flipVertical ? height : 0;

  // Get frame properties (v2.0)
  const frame = element.frame;

  // Helper function to get dash array for frame style
  const getDashArray = (style: string, width: number): number[] | undefined => {
    switch (style) {
      case 'dashed':
        return [width * 4, width * 2]; // Long dash, short gap
      case 'dotted':
        return [width, width]; // Equal dots and gaps
      case 'double':
        return undefined; // Will render two separate strokes
      default:
        return undefined; // Solid
    }
  };

  // Helper function to get Konva filters based on effect type
  const getEffectFilters = (effectType?: string, intensity?: number): any[] => {
    if (!effectType || effectType === 'none' || !intensity || intensity === 0) {
      return [];
    }

    switch (effectType) {
      case 'grayscale':
        return [Konva.Filters.Grayscale];

      case 'sepia':
        return [Konva.Filters.Sepia];

      case 'blur':
        // Note: Blur requires blurRadius property on the image
        return [Konva.Filters.Blur];

      case 'brighten':
        // Brighten filter - requires brightness property
        return [Konva.Filters.Brighten];

      case 'vintage':
        // Vintage = sepia + desaturation
        return [Konva.Filters.Sepia, Konva.Filters.HSL];

      case 'warm':
        // Warm = increase red/yellow tones
        return [Konva.Filters.RGB];

      case 'cool':
        // Cool = increase blue tones
        return [Konva.Filters.RGB];

      case 'vignette':
        // Vignette effect available in Konva
        return [Konva.Filters.Brighten];

      default:
        return [];
    }
  };

  // Get filter configuration properties based on effect
  const getEffectProperties = (effectType?: string, intensity?: number) => {
    if (!effectType || effectType === 'none' || !intensity || intensity === 0) {
      return {};
    }

    const normalizedIntensity = intensity / 100;

    switch (effectType) {
      case 'blur':
        return { blurRadius: normalizedIntensity * 20 }; // 0-20px blur

      case 'brighten':
        return { brightness: (normalizedIntensity - 0.5) * 0.5 }; // -0.25 to +0.25

      case 'vintage':
        return {
          saturation: -normalizedIntensity * 0.3, // Desaturate
          luminance: normalizedIntensity * 0.1     // Slight brightness
        };

      case 'warm':
        return {
          red: normalizedIntensity * 50,      // Add red
          green: normalizedIntensity * 20,    // Add slight green
          blue: -normalizedIntensity * 30     // Reduce blue
        };

      case 'cool':
        return {
          red: -normalizedIntensity * 30,     // Reduce red
          green: normalizedIntensity * 10,    // Add slight green
          blue: normalizedIntensity * 50      // Add blue
        };

      case 'vignette':
        // Simulate vignette with darkening at edges
        return { brightness: -normalizedIntensity * 0.3 };

      default:
        return {};
    }
  };

  const effectFilters = getEffectFilters(effect?.type, effect?.intensity);
  const effectProperties = getEffectProperties(effect?.type, effect?.intensity);

  // Full-image ghost preview coordinates (for when selected)
  // displayScale: how many stage pixels per source-image pixel
  const displayScale = width / cropWidth;
  const fullImgWidth = image.width * displayScale;
  const fullImgHeight = image.height * displayScale;
  // Position so the crop region aligns exactly with the placeholder
  const fullImgX = x - cropX * displayScale;
  const fullImgY = y - cropY * displayScale;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    // Calculate drag delta in stage pixels
    const dragDeltaX = node.x() - x;
    const dragDeltaY = node.y() - y;

    // Reset node position back to original (element stays in place on page)
    node.x(x);
    node.y(y);

    // Convert pixel drag to normalized pan offset
    // Dragging right = image content shifts left = negative pan delta
    // Scale relative to slack (available pan range in source image pixels)
    if (slackX > 0 || slackY > 0) {
      // Map drag pixels to source image pixels, then to normalized pan
      // width pixels on screen = cropWidth source pixels, so ratio = cropWidth / width
      const srcDeltaX = dragDeltaX * (cropWidth / width);
      const srcDeltaY = dragDeltaY * (cropHeight / height);

      const newPanX = slackX > 0
        ? Math.max(-0.5, Math.min(0.5, (transform.panX || 0) - srcDeltaX / slackX))
        : 0;
      const newPanY = slackY > 0
        ? Math.max(-0.5, Math.min(0.5, (transform.panY || 0) - srcDeltaY / slackY))
        : 0;

      updateElement(pageId, element.id, {
        transform: { ...transform, panX: newPanX, panY: newPanY },
      });
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Image;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update width/height instead
    node.scaleX(1);
    node.scaleY(1);

    onTransform({
      x: (node.x() / pageDimensions.width) * 100,
      y: (node.y() / pageDimensions.height) * 100,
      width: ((node.width() * scaleX) / pageDimensions.width) * 100,
      height: ((node.height() * scaleY) / pageDimensions.height) * 100,
      rotation: node.rotation(),
    });
  };

  return (
    <Group>
      {/* Ghost image preview: show full uncropped image greyed out while mouse is pressed */}
      {isSelected && isMouseDown && (
        <>
          {/* Full uncropped image at reduced opacity */}
          <Image
            image={image}
            x={fullImgX}
            y={fullImgY}
            width={fullImgWidth}
            height={fullImgHeight}
            opacity={0.3}
            listening={false}
            perfectDrawEnabled={false}
          />
          {/* Dark overlay on the ghost image */}
          <Rect
            x={fullImgX}
            y={fullImgY}
            width={fullImgWidth}
            height={fullImgHeight}
            fill="black"
            opacity={0.4}
            listening={false}
          />
        </>
      )}

      <Image
        ref={imageRef}
        id={element.id}
        name="element"
        image={image}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={element.rotation}
        draggable={!element.locked}
        onClick={onClick}
        onTap={onClick}
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onDragEnd={(e) => {
          setIsMouseDown(false);
          handleDragEnd(e);
        }}
        onTransformEnd={handleTransformEnd}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'move';
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'default';
        }}
        // Apply zoom via crop
        crop={{
          x: cropX,
          y: cropY,
          width: cropWidth,
          height: cropHeight,
        }}
        // Apply flip transforms
        scaleX={scaleX}
        scaleY={scaleY}
        offsetX={offsetX}
        offsetY={offsetY}
        // Apply photo effects (v2.0)
        filters={effectFilters.length > 0 ? effectFilters : undefined}
        {...effectProperties}
        // Performance optimization
        perfectDrawEnabled={false}
        // Selection styling
        shadowColor={isSelected ? '#8b5cf6' : undefined}
        shadowBlur={isSelected ? 10 : 0}
        shadowOpacity={isSelected ? 0.8 : 0}
      />

      {/* Pan move icon - shown when selected */}
      {isSelected && (slackX > 0 || slackY > 0) && (() => {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const iconR = Math.min(width, height) * 0.08;
        const arrowLen = iconR * 0.55;
        const arrowHead = iconR * 0.25;
        return (
          <Group listening={false} opacity={0.7}>
            {/* Background circle */}
            <Circle x={cx} y={cy} radius={iconR} fill="rgba(0,0,0,0.45)" />
            {/* Up arrow */}
            <Arrow points={[cx, cy - arrowLen * 0.15, cx, cy - arrowLen]} stroke="#fff" strokeWidth={iconR * 0.1} pointerLength={arrowHead} pointerWidth={arrowHead} fill="#fff" />
            {/* Down arrow */}
            <Arrow points={[cx, cy + arrowLen * 0.15, cx, cy + arrowLen]} stroke="#fff" strokeWidth={iconR * 0.1} pointerLength={arrowHead} pointerWidth={arrowHead} fill="#fff" />
            {/* Left arrow */}
            <Arrow points={[cx - arrowLen * 0.15, cy, cx - arrowLen, cy]} stroke="#fff" strokeWidth={iconR * 0.1} pointerLength={arrowHead} pointerWidth={arrowHead} fill="#fff" />
            {/* Right arrow */}
            <Arrow points={[cx + arrowLen * 0.15, cy, cx + arrowLen, cy]} stroke="#fff" strokeWidth={iconR * 0.1} pointerLength={arrowHead} pointerWidth={arrowHead} fill="#fff" />
          </Group>
        );
      })()}

      {/* Render frame if enabled (v2.0) */}
      {frame?.enabled && (
        <>
          {frame.style === 'double' ? (
            // Double frame: render two rectangles
            <>
              <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                rotation={element.rotation}
                stroke={frame.color}
                strokeWidth={frame.width}
                listening={false}
                perfectDrawEnabled={false}
              />
              <Rect
                x={x + frame.width * 2}
                y={y + frame.width * 2}
                width={width - frame.width * 4}
                height={height - frame.width * 4}
                rotation={element.rotation}
                stroke={frame.color}
                strokeWidth={frame.width}
                listening={false}
                perfectDrawEnabled={false}
              />
            </>
          ) : (
            // Single frame with style
            <Rect
              x={x}
              y={y}
              width={width}
              height={height}
              rotation={element.rotation}
              stroke={frame.color}
              strokeWidth={frame.width}
              dash={getDashArray(frame.style, frame.width)}
              listening={false}
              perfectDrawEnabled={false}
            />
          )}
        </>
      )}
    </Group>
  );
}
