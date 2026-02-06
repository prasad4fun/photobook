// @ts-nocheck
/**
 * Element Transformer - Provides resize/rotate handles for selected elements
 */

import React, { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import type { StudioPageElement } from '../../../../types';

interface ElementTransformerProps {
  selectedElementIds: string[];
  elements: StudioPageElement[];
  onTransform: (elementId: string, attrs: Partial<PageElement>) => void;
}

export default function ElementTransformer({
  selectedElementIds,
  elements,
  onTransform,
}: ElementTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    // Find the Konva nodes for selected elements
    const stage = transformer.getStage();
    if (!stage) return;

    const selectedNodes: Konva.Node[] = [];
    selectedElementIds.forEach((id) => {
      const node = stage.findOne(`#${id}`);
      if (node) {
        selectedNodes.push(node);
      }
    });

    // Attach transformer to selected nodes
    transformer.nodes(selectedNodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedElementIds]);

  if (selectedElementIds.length === 0) {
    return null;
  }

  return (
    <Transformer
      ref={transformerRef}
      // Styling
      borderStroke="#8b5cf6"
      borderStrokeWidth={2}
      anchorFill="#8b5cf6"
      anchorStroke="#ffffff"
      anchorStrokeWidth={2}
      anchorSize={12}
      anchorCornerRadius={6}
      // Rotation
      rotateAnchorOffset={30}
      rotateEnabled={true}
      // Resize
      enabledAnchors={[
        'top-left',
        'top-center',
        'top-right',
        'middle-right',
        'middle-left',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ]}
      // Keep ratio with shift key
      keepRatio={false}
      // Boundaries
      boundBoxFunc={(oldBox, newBox) => {
        // Prevent negative dimensions
        if (newBox.width < 10 || newBox.height < 10) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
}
