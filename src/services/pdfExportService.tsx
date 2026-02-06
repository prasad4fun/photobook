import { Document, Page, Image, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { PDFExportOptions, PhotoTemplate, GeneratedImage } from '../types';
import { captureError, addBreadcrumb } from '../utils/sentry';

/**
 * PDF Export Service
 *
 * Generates professional print-quality PDFs with:
 * - 300 DPI resolution (A4 = 2480x3508px)
 * - Template-based layouts
 * - Multi-page support
 * - Cover page generation
 * - High-quality JPEG compression
 */

// ============================================================================
// PDF Export Constants
// ============================================================================

// A4 dimensions at different DPIs
export const PDF_DIMENSIONS = {
  '300': { width: 2480, height: 3508 }, // A4 at 300 DPI
  '600': { width: 4960, height: 7016 }, // A4 at 600 DPI
};

// Page size presets (in points, 1 point = 1/72 inch)
export const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  Letter: { width: 612, height: 792 },
  '8x10': { width: 576, height: 720 },
  '5x7': { width: 360, height: 504 },
  square: { width: 612, height: 612 },
};

// Convert our format to react-pdf's PageSize type
function convertToReactPDFSize(format: 'A4' | 'Letter' | '8x10' | '5x7' | 'square'): any {
  const mapping: Record<string, any> = {
    A4: 'A4',
    Letter: 'LETTER',
    '8x10': { width: 576, height: 720 },
    '5x7': { width: 360, height: 504 },
    square: { width: 612, height: 612 },
  };
  return mapping[format];
}

// ============================================================================
// Main Export Function
// ============================================================================

export async function generatePDF(
  generatedImages: GeneratedImage[],
  template: PhotoTemplate | null,
  options: PDFExportOptions,
  themeName: string
): Promise<Blob> {
  addBreadcrumb('Starting PDF generation', 'pdf', {
    imageCount: generatedImages.length,
    template: template?.name,
    dpi: options.dpi,
  });

  try {
    // Prepare pages based on template
    const pages = template
      ? await preparePagesWithTemplate(generatedImages, template, options)
      : await preparePagesWithoutTemplate(generatedImages, options);

    // Create PDF document
    const doc = (
      <PDFDocument
        pages={pages}
        options={options}
        themeName={themeName}
        template={template}
      />
    );

    // Generate blob
    const blob = await pdf(doc).toBlob();

    addBreadcrumb('PDF generation complete', 'pdf', {
      size: blob.size,
      pages: pages.length,
    });

    return blob;
  } catch (error) {
    captureError(error as Error, {
      service: 'pdfExport',
      operation: 'generatePDF',
      imageCount: generatedImages.length,
    });
    throw new Error(`PDF generation failed: ${(error as Error).message}`);
  }
}

// ============================================================================
// Page Preparation
// ============================================================================

interface PDFPageData {
  pageNumber: number;
  images: Array<{
    data: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    borderRadius?: number;
  }>;
  texts: Array<{
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
  }>;
  background?: {
    color: string;
    gradient?: string | null;
  };
}

async function preparePagesWithTemplate(
  generatedImages: GeneratedImage[],
  template: PhotoTemplate,
  options: PDFExportOptions
): Promise<PDFPageData[]> {
  const pages: PDFPageData[] = [];
  const pageSize = PAGE_SIZES[options.format];
  const layout = template.layout;

  // Calculate how many pages we need based on slots
  const slotsPerPage = layout.imageSlots.length;
  const pageCount = Math.ceil(generatedImages.length / slotsPerPage);

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const startIdx = pageIndex * slotsPerPage;
    const endIdx = Math.min(startIdx + slotsPerPage, generatedImages.length);
    const pageImages = generatedImages.slice(startIdx, endIdx);

    const page: PDFPageData = {
      pageNumber: pageIndex + 1,
      images: [],
      texts: [],
      background: layout.background,
    };

    // Map images to slots
    for (let i = 0; i < pageImages.length; i++) {
      const slot = layout.imageSlots[i];
      if (!slot) continue;

      const image = pageImages[i];

      // Convert percentage-based positions to absolute coordinates
      const x = (slot.x / 100) * pageSize.width;
      const y = (slot.y / 100) * pageSize.height;
      const width = (slot.width / 100) * pageSize.width;
      const height = (slot.height / 100) * pageSize.height;

      page.images.push({
        data: image.themed_base64,
        x,
        y,
        width,
        height,
        rotation: slot.rotation,
        borderRadius: slot.borderRadius,
      });
    }

    pages.push(page);
  }

  return pages;
}

async function preparePagesWithoutTemplate(
  generatedImages: GeneratedImage[],
  options: PDFExportOptions
): Promise<PDFPageData[]> {
  const pageSize = PAGE_SIZES[options.format];

  // One image per page, centered and fit to page with margins
  return generatedImages.map((image, index) => ({
    pageNumber: index + 1,
    images: [
      {
        data: image.themed_base64,
        x: options.margins.left,
        y: options.margins.top,
        width: pageSize.width - options.margins.left - options.margins.right,
        height: pageSize.height - options.margins.top - options.margins.bottom,
      },
    ],
    texts: [],
    background: {
      color: '#ffffff',
    },
  }));
}

// ============================================================================
// PDF Document Component
// ============================================================================

interface PDFDocumentProps {
  pages: PDFPageData[];
  options: PDFExportOptions;
  themeName: string;
  template: PhotoTemplate | null;
}

function PDFDocument({ pages, options, themeName, template }: PDFDocumentProps) {
  return (
    <Document
      title={`${themeName} Photo Album`}
      author="AI Photo Themes"
      subject={`${themeName} themed photo album`}
      creator="AI Photo Themes"
    >
      {/* Cover Page */}
      {options.includeCover && (
        <Page size={convertToReactPDFSize(options.format)} orientation={options.orientation} style={styles.page}>
          <View style={styles.coverPage}>
            <Text style={styles.coverTitle}>{themeName}</Text>
            <Text style={styles.coverSubtitle}>Photo Album</Text>
            <Text style={styles.coverDate}>
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {template && (
              <Text style={styles.coverTemplate}>{template.name} Layout</Text>
            )}
          </View>
        </Page>
      )}

      {/* Content Pages */}
      {pages.map((page) => (
        <Page
          key={page.pageNumber}
          size={convertToReactPDFSize(options.format)}
          orientation={options.orientation}
          style={{
            ...styles.page,
            backgroundColor: page.background?.color || '#ffffff',
          }}
        >
          {/* Background Gradient (if supported) */}
          {page.background?.gradient && (
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: page.background.color,
              }}
            />
          )}

          {/* Images */}
          {page.images.map((img, idx) => (
            <Image
              key={idx}
              src={`data:image/jpeg;base64,${img.data}`}
              style={{
                position: 'absolute',
                left: img.x,
                top: img.y,
                width: img.width,
                height: img.height,
                objectFit: 'cover',
                transform: img.rotation ? `rotate(${img.rotation}deg)` : undefined,
                borderRadius: img.borderRadius,
              }}
            />
          ))}

          {/* Text Elements */}
          {page.texts.map((txt, idx) => (
            <Text
              key={idx}
              style={{
                position: 'absolute',
                left: txt.x,
                top: txt.y,
                fontSize: txt.fontSize,
                color: txt.color,
              }}
            >
              {txt.text}
            </Text>
          ))}

          {/* Page Number */}
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        </Page>
      ))}

      {/* Back Cover */}
      {options.includeBackCover && (
        <Page size={convertToReactPDFSize(options.format)} orientation={options.orientation} style={styles.page}>
          <View style={styles.backCoverPage}>
            <Text style={styles.backCoverText}>
              Created with AI Photo Themes
            </Text>
            <Text style={styles.backCoverUrl}>
              https://ai-photo-themes.com
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  coverTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  coverSubtitle: {
    fontSize: 24,
    marginBottom: 40,
    textAlign: 'center',
    color: '#666666',
  },
  coverDate: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    color: '#999999',
  },
  coverTemplate: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999999',
  },
  backCoverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  backCoverText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#666666',
  },
  backCoverUrl: {
    fontSize: 12,
    textAlign: 'center',
    color: '#999999',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 10,
    color: '#999999',
  },
});

// ============================================================================
// Utility Functions
// ============================================================================

export function calculatePDFFileSize(
  imageCount: number,
  dpi: 300 | 600,
  compressionQuality: number = 0.95
): number {
  // Rough estimate: base size + (image size * count)
  const baseSize = 50 * 1024; // 50 KB for PDF structure
  const avgImageSize = dpi === 300 ? 500 * 1024 : 2 * 1024 * 1024; // 500 KB or 2 MB per image
  const compressedSize = avgImageSize * compressionQuality;

  return baseSize + compressedSize * imageCount;
}

export function getRecommendedDPI(imageCount: number): 300 | 600 {
  // Recommend 300 DPI for most cases, 600 DPI for professional printing with few images
  return imageCount <= 5 ? 600 : 300;
}

export function validatePDFOptions(options: PDFExportOptions): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!['A4', 'Letter', '8x10', '5x7', 'square'].includes(options.format)) {
    errors.push('Invalid format');
  }

  if (!['portrait', 'landscape'].includes(options.orientation)) {
    errors.push('Invalid orientation');
  }

  if (![300, 600].includes(options.dpi)) {
    errors.push('DPI must be 300 or 600');
  }

  if (!['RGB', 'CMYK'].includes(options.colorSpace)) {
    errors.push('Color space must be RGB or CMYK');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Image Processing for 300 DPI
// ============================================================================

export async function convertImageTo300DPI(
  base64Image: string,
  targetWidth: number = 2480
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculate dimensions maintaining aspect ratio
      const aspectRatio = img.width / img.height;
      canvas.width = targetWidth;
      canvas.height = targetWidth / aspectRatio;

      // Draw image at high resolution
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Export as high-quality JPEG
      const highResBase64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
      resolve(highResBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Add data URL prefix if not present
    img.src = base64Image.startsWith('data:')
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;
  });
}

export async function batchConvertImagesTo300DPI(
  images: GeneratedImage[],
  onProgress?: (completed: number, total: number) => void
): Promise<GeneratedImage[]> {
  const converted: GeneratedImage[] = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    try {
      const highResBase64 = await convertImageTo300DPI(image.themed_base64, 2480);

      converted.push({
        ...image,
        themed_base64: highResBase64,
      });

      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    } catch (error) {
      console.error(`Failed to convert image ${i}:`, error);
      // Use original if conversion fails
      converted.push(image);
    }
  }

  return converted;
}
