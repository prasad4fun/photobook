/**
 * Export Utilities - Export photobook as images or JSON
 */

import type { StudioPhotoBook } from '../../types';

/**
 * Export photobook as JSON (for saving project)
 */
export function exportAsJSON(photoBook: StudioPhotoBook): string {
  return JSON.stringify(photoBook, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJSON(photoBook: StudioPhotoBook, filename: string = 'photobook.json') {
  const json = exportAsJSON(photoBook);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export single page as image (requires Konva Stage ref)
 * This should be called with the Stage reference from PageCanvas
 */
export function exportPageAsImage(
  stageRef: any,
  pageNumber: number,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 1.0
): string | null {
  if (!stageRef || !stageRef.current) return null;

  const stage = stageRef.current;

  try {
    const dataURL = stage.toDataURL({
      mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
      quality: quality,
      pixelRatio: 3, // High resolution for print
    });

    return dataURL;
  } catch (error) {
    console.error('Error exporting page as image:', error);
    return null;
  }
}

/**
 * Download page as image file
 */
export function downloadPageImage(
  stageRef: any,
  pageNumber: number,
  filename?: string,
  format: 'png' | 'jpeg' = 'png'
) {
  const dataURL = exportPageAsImage(stageRef, pageNumber, format);
  if (!dataURL) {
    console.error('Failed to export page as image');
    return;
  }

  const finalFilename = filename || `page-${pageNumber}.${format}`;

  const link = document.createElement('a');
  link.href = dataURL;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export all pages as images (returns array of data URLs)
 * Note: This requires accessing all page Stage refs
 */
export async function exportAllPagesAsImages(
  pageStageRefs: any[],
  format: 'png' | 'jpeg' = 'png',
  quality: number = 1.0
): Promise<string[]> {
  const images: string[] = [];

  for (let i = 0; i < pageStageRefs.length; i++) {
    const dataURL = exportPageAsImage(pageStageRefs[i], i + 1, format, quality);
    if (dataURL) {
      images.push(dataURL);
    }
  }

  return images;
}

/**
 * Create ZIP file with all pages (browser-based)
 * Requires JSZip library (already in parent project)
 */
export async function downloadAllPagesAsZip(
  pageStageRefs: any[],
  filename: string = 'photobook-pages.zip',
  format: 'png' | 'jpeg' = 'png'
) {
  try {
    // Dynamic import to avoid bundling if not used
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Export all pages
    for (let i = 0; i < pageStageRefs.length; i++) {
      const dataURL = exportPageAsImage(pageStageRefs[i], i + 1, format);
      if (dataURL) {
        // Convert data URL to blob
        const base64 = dataURL.split(',')[1];
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) {
          array[j] = binary.charCodeAt(j);
        }
        const blob = new Blob([array], { type: `image/${format}` });

        // Add to zip
        zip.file(`page-${i + 1}.${format}`, blob);
      }
    }

    // Generate zip file
    const content = await zip.generateAsync({ type: 'blob' });

    // Download
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    return false;
  }
}

/**
 * Load photobook from JSON
 */
export function loadFromJSON(json: string): StudioPhotoBook | null {
  try {
    const photoBook = JSON.parse(json);

    // Validate basic structure
    if (!photoBook.id || !photoBook.pages || !Array.isArray(photoBook.pages)) {
      throw new Error('Invalid photobook JSON structure');
    }

    // Convert date strings back to Date objects
    photoBook.createdAt = new Date(photoBook.createdAt);
    photoBook.updatedAt = new Date(photoBook.updatedAt);

    return photoBook;
  } catch (error) {
    console.error('Error loading photobook from JSON:', error);
    return null;
  }
}

/**
 * Get export statistics
 */
export function getExportStats(photoBook: StudioPhotoBook) {
  const totalPages = photoBook.pages.length;
  const totalElements = photoBook.pages.reduce(
    (sum, page) => sum + page.elements.length,
    0
  );
  const photoElements = photoBook.pages.reduce(
    (sum, page) => sum + page.elements.filter((el) => el.type === 'photo').length,
    0
  );
  const textElements = photoBook.pages.reduce(
    (sum, page) => sum + page.elements.filter((el) => el.type === 'text').length,
    0
  );

  return {
    totalPages,
    totalElements,
    photoElements,
    textElements,
    createdAt: photoBook.createdAt,
    updatedAt: photoBook.updatedAt,
  };
}
