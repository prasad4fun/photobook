import { Rect, Ellipse } from 'react-konva';
import Konva from 'konva';
import { ShapeElement } from '../../../types';

interface PhotobookShapeElementProps {
  element: ShapeElement;
  onSelect: (e?: any) => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (width: number, height: number, rotation: number) => void;
}

export default function PhotobookShapeElement({
  element,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: PhotobookShapeElementProps) {
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragEnd(node.x(), node.y());
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as any;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(10, (element.shapeType === 'ellipse' ? node.radiusX() : node.width()) * scaleX);
    const newHeight = Math.max(10, (element.shapeType === 'ellipse' ? node.radiusY() : node.height()) * scaleY);
    const rotation = node.rotation();

    onTransformEnd(newWidth, newHeight, rotation);
  };

  const commonProps = {
    rotation: element.rotation,
    fill: element.fill || undefined,
    stroke: element.stroke || undefined,
    strokeWidth: element.strokeWidth,
    opacity: element.opacity / 100,
    draggable: !element.locked,
    listening: !element.locked,
    visible: element.visible,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  if (element.shapeType === 'rectangle') {
    return (
      <Rect
        id={element.id}
        name="photobookShape"
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        cornerRadius={element.borderRadius}
        {...commonProps}
      />
    );
  }

  if (element.shapeType === 'ellipse') {
    return (
      <Ellipse
        id={element.id}
        name="photobookShape"
        x={element.x + element.width / 2}
        y={element.y + element.height / 2}
        radiusX={element.width / 2}
        radiusY={element.height / 2}
        {...commonProps}
      />
    );
  }

  return null;
}
