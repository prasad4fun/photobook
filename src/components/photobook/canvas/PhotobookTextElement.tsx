import { Text, Rect, Group } from 'react-konva';
import Konva from 'konva';
import { TextElement } from '../../../types';

interface PhotobookTextElementProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: (e?: any) => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (width: number, height: number, rotation: number) => void;
  onDoubleClick: () => void;
}

export default function PhotobookTextElement({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  onDoubleClick,
}: PhotobookTextElementProps) {
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onDragEnd(node.x(), node.y());
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Text;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(50, node.width() * scaleX);
    const newHeight = Math.max(20, node.height() * scaleY);
    const rotation = node.rotation();

    onTransformEnd(newWidth, newHeight, rotation);
  };

  return (
    <Group>
      {/* Background rectangle for better visibility */}
      {isSelected && (
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill="transparent"
          stroke="#8b5cf6"
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
        />
      )}

      <Text
        id={element.id}
        name="photobookText"
        text={element.content}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={element.fontStyle}
        fill={element.color}
        align={element.textAlign}
        verticalAlign={element.verticalAlign}
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        textDecoration={element.textDecoration}
        opacity={element.opacity / 100}
        draggable={!element.locked}
        listening={!element.locked}
        visible={element.visible}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onDoubleClick}
        onDblTap={onDoubleClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        padding={element.padding.left} // Konva uses single padding value
        wrap="word"
      />
    </Group>
  );
}
