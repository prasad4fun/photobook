/**
 * Quality Warning Badge Component
 * v2.0 - Displays warning icon for low-quality photos
 */

import React from 'react';
import type { StudioPhoto } from '../../../types';

interface QualityWarningBadgeProps {
  photo: StudioPhoto;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function QualityWarningBadge({
  photo,
  position = 'top-left',
}: QualityWarningBadgeProps) {
  // Don't render if no warning
  if (!photo.qualityWarning) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  // Determine tooltip positioning based on badge position
  const isRightAligned = position === 'top-right' || position === 'bottom-right';
  const tooltipPositionClass = isRightAligned ? 'right-0' : 'left-0';
  const arrowPositionClass = isRightAligned ? 'right-4' : 'left-4';

  return (
    <div
      className={`absolute ${positionClasses[position]} z-10 group`}
      title={photo.qualityMessage}
    >
      {/* Warning Icon */}
      <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Tooltip on hover */}
      <div className={`absolute ${tooltipPositionClass} top-8 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-20 border border-slate-700`}>
        <div className="font-semibold mb-1">Low Photo Quality</div>
        <div className="text-slate-300">{photo.qualityMessage}</div>
        {photo.qualityScore !== undefined && (
          <div className="mt-2 text-slate-400 text-[10px]">
            Quality Score: {photo.qualityScore}/100
          </div>
        )}
        {/* Tooltip arrow */}
        <div className={`absolute -top-1 ${arrowPositionClass} w-2 h-2 bg-slate-900 border-l border-t border-slate-700 transform rotate-45`} />
      </div>
    </div>
  );
}
