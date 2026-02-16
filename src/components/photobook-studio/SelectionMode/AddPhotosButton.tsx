/**
 * Add Photos Button - File picker for adding photos
 * v2.0 - Added quality calculation
 */

import React, { useRef } from 'react';
import { Plus, Upload } from 'lucide-react';
import { usePhotoBookStore } from '../../../hooks/usePhotoBookStore';
import type { StudioPhoto } from '../../../types';
import { STUDIO_DEFAULT_PAGE_CONFIG } from '../../../types';
import {
  validateImageFile,
  fileToBase64,
  createThumbnail,
  loadImage,
  generateId,
  calculatePhotoQuality,
} from '../../../utils/photobook-studio/helpers';

interface AddPhotosButtonProps {
  maxPhotos: number;
  currentCount: number;
}

export default function AddPhotosButton({
  maxPhotos,
  currentCount,
}: AddPhotosButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPhotos = usePhotoBookStore((state) => state.addPhotos);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these photos would exceed max
    if (currentCount + files.length > maxPhotos) {
      alert(
        `Cannot add ${files.length} photos. Maximum is ${maxPhotos} photos total. Current: ${currentCount}`
      );
      return;
    }

    const newPhotos: StudioPhoto[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`);
          continue;
        }

        // Convert to base64
        const url = await fileToBase64(file);

        // Create thumbnail
        const thumbnailUrl = await createThumbnail(file);

        // Get dimensions
        const img = await loadImage(url);

        // Calculate photo quality
        const quality = calculatePhotoQuality(
          { width: img.width, height: img.height },
          STUDIO_DEFAULT_PAGE_CONFIG.pageSize
        );

        const photo: StudioPhoto = {
          id: generateId('photo'),
          url,
          thumbnailUrl,
          width: img.width,
          height: img.height,
          fileSize: file.size,
          fileName: file.name,
          addedAt: new Date(),
          qualityScore: quality.score,
          qualityWarning: quality.warning,
          qualityMessage: quality.message,
        };

        newPhotos.push(photo);
      } catch (error) {
        errors.push(`${file.name}: Failed to process`);
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    if (newPhotos.length > 0) {
      addPhotos(newPhotos);
    }

    if (errors.length > 0) {
      alert(`Some files could not be added:\n${errors.join('\n')}`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const remainingSlots = maxPhotos - currentCount;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-48 h-48 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-500 hover:bg-slate-900/50 transition-all">
        <Upload size={48} className="text-slate-600" />
        <p className="text-slate-400 text-sm text-center px-4">
          Drag and Drop or click to add photos from another source.
        </p>
      </div>

      <button
        onClick={handleClick}
        disabled={remainingSlots === 0}
        className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-medium flex items-center gap-2 transition-colors"
      >
        <Plus size={20} />
        Add Photos
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
