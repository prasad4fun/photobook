// @ts-nocheck
/**
 * Text Editor - Textarea overlay for inline text editing
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Konva from 'konva';
import { StudioTextElement } from '../../../../types';

interface TextEditorProps {
  element: StudioTextElement;
  textNode: Konva.Text | null;
  onTextChange: (newText: string) => void;
  onClose: () => void;
}

export default function TextEditor({
  element,
  textNode,
  onTextChange,
  onClose,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textNode || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const stage = textNode.getStage();
    if (!stage) return;

    // Get text position on screen
    const textPosition = textNode.getAbsolutePosition();
    const stageBox = stage.container().getBoundingClientRect();
    const scale = stage.scaleX();

    // Position textarea
    const areaPosition = {
      x: stageBox.left + textPosition.x * scale,
      y: stageBox.top + textPosition.y * scale,
    };

    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = textNode.width() * scale + 'px';
    textarea.style.height = textNode.height() * scale + 'px';

    // Style to match text
    textarea.style.fontSize = element.fontSize * scale + 'px';
    textarea.style.fontFamily = element.fontFamily;
    textarea.style.fontStyle = element.fontStyle;
    textarea.style.color = element.color;
    textarea.style.textAlign = element.textAlign;
    textarea.style.lineHeight = element.lineHeight.toString();
    textarea.style.padding = (element.padding || 0) * scale + 'px';

    if (element.backgroundColor) {
      textarea.style.backgroundColor = element.backgroundColor;
    } else {
      textarea.style.backgroundColor = 'transparent';
    }

    // Set value and focus
    textarea.value = element.content;
    textarea.focus();
    textarea.select();

    // Handle blur and Enter key
    const handleBlur = () => {
      onTextChange(textarea.value);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Save on Cmd/Ctrl+Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onTextChange(textarea.value);
      }
      // Cancel on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    textarea.addEventListener('blur', handleBlur);
    textarea.addEventListener('keydown', handleKeyDown);

    return () => {
      textarea.removeEventListener('blur', handleBlur);
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  }, [textNode, element, onTextChange, onClose]);

  // Render textarea as portal to body
  return createPortal(
    <textarea
      ref={textareaRef}
      className="resize-none border-2 border-violet-500 outline-none shadow-lg"
      style={{
        position: 'absolute',
        zIndex: 9999,
      }}
    />,
    document.body
  );
}
