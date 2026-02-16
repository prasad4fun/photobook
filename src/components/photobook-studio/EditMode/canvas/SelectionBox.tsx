/**
 * Selection Box - Visual indicator for drag selection
 */

import React, { useState } from 'react';
import { Rect } from 'react-konva';

interface SelectionBoxProps {
  onSelect: (elementIds: string[]) => void;
}

export default function SelectionBox({ onSelect }: SelectionBoxProps) {
  const [selectionRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  if (!selectionRect) return null;

  return (
    <Rect
      x={selectionRect.x}
      y={selectionRect.y}
      width={selectionRect.width}
      height={selectionRect.height}
      fill="rgba(139, 92, 246, 0.1)"
      stroke="#8b5cf6"
      strokeWidth={2}
      dash={[10, 5]}
      listening={false}
    />
  );
}
