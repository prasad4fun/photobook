import { useState } from 'react';
import { Download, Package, Star, CheckCircle2, Share2, Home, FileText } from 'lucide-react';
import { OrderDetails } from '../types';
import { useSession } from '../hooks/useSession';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generatePDF } from '../services/pdfExportService';

interface DeliveryScreenProps {
  jobId: string;
  orderDetails: OrderDetails | null;
  onStartNew: () => void;
}

export default function DeliveryScreen({ jobId, orderDetails, onStartNew }: DeliveryScreenProps) {
  const { sessionData } = useSession();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownload = async () => {
    if (sessionData.uploadedImages.length === 0) {
      alert('No images available to download.');
      return;
    }

    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('edited-photos');

      // Add each image to the ZIP
      for (let i = 0; i < sessionData.uploadedImages.length; i++) {
        const image = sessionData.uploadedImages[i];

        // Fetch the blob from the preview URL
        const response = await fetch(image.preview);
        const blob = await response.blob();

        // Add to ZIP with theme name prefix
        const themeName = orderDetails?.theme?.name.replace(/\s+/g, '-').toLowerCase() || 'edited';
        const fileName = `${themeName}-${i + 1}.${image.name.split('.').pop()}`;
        folder?.file(fileName, blob);
      }

      // Generate ZIP file
      const content = await zip.generateAsync({ type: 'blob' });

      // Download ZIP file
      const zipFileName = `${orderDetails?.theme?.name.replace(/\s+/g, '-').toLowerCase() || 'photos'}-${jobId}.zip`;
      saveAs(content, zipFileName);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download images. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!sessionData.generatedImages || sessionData.generatedImages.length === 0) {
      alert('No images available for PDF generation.');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Use PDF export options from session, or default
      const pdfOptions = sessionData.pdfExportOptions || {
        format: 'A4' as const,
        orientation: 'portrait' as const,
        dpi: 300,
        colorSpace: 'RGB' as const,
        includeCover: true,
        includeBackCover: false,
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
      };

      const themeName = orderDetails?.theme?.name || 'Photo Album';

      // Generate PDF
      const pdfBlob = await generatePDF(
        sessionData.generatedImages,
        sessionData.selectedTemplate,
        pdfOptions,
        themeName
      );

      // Download PDF
      const fileName = `${themeName.replace(/\s+/g, '-').toLowerCase()}-album-${jobId}.pdf`;
      saveAs(pdfBlob, fileName);

    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleOrderPhotobook = () => {
    alert('Photobook order page would open here.');
  };

  const handleSubmitFeedback = () => {
    if (rating > 0) {
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-6 animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text mb-4">
            Your Photos Are Ready!
          </h2>
          <p className="text-slate-400 text-xl">
            Job ID: <span className="text-slate-300 font-mono">{jobId}</span>
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-8 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl mb-8">
          <h3 className="text-2xl font-bold text-slate-200 mb-6">Order Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Theme</p>
              <p className="text-lg font-bold text-violet-300">{orderDetails?.theme?.name || 'Custom Theme'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Images</p>
              <p className="text-lg font-bold text-slate-200">{orderDetails?.imageCount || 0} photos</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Package</p>
              <p className="text-lg font-bold text-slate-200">
                {orderDetails?.package === 'digital' ? 'Digital Only' : 'Digital + Photobook'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Download ZIP Card */}
          <div className="group relative overflow-hidden p-8 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-2 border-violet-500/30 rounded-3xl hover:scale-102 transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-100 mb-2">Download ZIP</h3>
              <p className="text-slate-400 mb-6">
                All your edited photos in high resolution
              </p>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-violet-500/30 ${
                  isDownloading
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500'
                }`}
              >
                {isDownloading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Preparing...
                  </span>
                ) : (
                  'Download ZIP'
                )}
              </button>
            </div>
          </div>

          {/* Download PDF Card */}
          <div className="group relative overflow-hidden p-8 bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-2 border-rose-500/30 rounded-3xl hover:scale-102 transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-100 mb-2">Download PDF</h3>
              <p className="text-slate-400 mb-6">
                Print-ready album at 300 DPI
              </p>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-rose-500/30 ${
                  isGeneratingPDF
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500'
                }`}
              >
                {isGeneratingPDF ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </span>
                ) : (
                  'Download PDF'
                )}
              </button>
            </div>
          </div>

          {/* Photobook Card */}
          <div className={`group relative overflow-hidden p-8 rounded-3xl hover:scale-102 transition-all ${
            orderDetails?.package === 'photobook'
              ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30'
              : 'bg-slate-800/40 border-2 border-slate-700/50 cursor-pointer'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${
              orderDetails?.package === 'photobook' ? 'bg-emerald-500/10' : 'bg-slate-700/10'
            }`}></div>
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                orderDetails?.package === 'photobook'
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                  : 'bg-slate-700/50'
              }`}>
                <Package className={`w-8 h-8 ${
                  orderDetails?.package === 'photobook' ? 'text-emerald-400' : 'text-slate-400'
                }`} />
              </div>
              <h3 className="text-2xl font-black text-slate-100 mb-2">
                {orderDetails?.package === 'photobook' ? 'Photobook Ordered' : 'Order Photobook'}
              </h3>
              <p className="text-slate-400 mb-6">
                {orderDetails?.package === 'photobook'
                  ? 'Your photobook will be delivered in 5-7 days'
                  : 'Get a premium printed photobook delivered'}
              </p>
              {orderDetails?.package === 'photobook' ? (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Order Confirmed</span>
                </div>
              ) : (
                <button
                  onClick={handleOrderPhotobook}
                  className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-slate-200 transition-all"
                >
                  Order Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="p-8 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl mb-8">
          <h3 className="text-2xl font-bold text-slate-200 mb-6">How was your experience?</h3>
          
          {!feedbackSubmitted ? (
            <>
              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Text */}
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience (optional)"
                className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors mb-4 resize-none"
                rows={4}
              />

              <button
                onClick={handleSubmitFeedback}
                disabled={rating === 0}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  rating > 0
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Submit Feedback
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-lg font-semibold">Thank you for your feedback!</span>
            </div>
          )}
        </div>

        {/* Share & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartNew}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-violet-500/30 flex items-center gap-3"
          >
            <Home className="w-5 h-5" />
            Start New Project
          </button>
          
          <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 backdrop-blur-sm border-2 border-slate-700 hover:border-slate-600 rounded-xl font-semibold text-slate-300 transition-all flex items-center gap-3">
            <Share2 className="w-5 h-5" />
            Share Experience
          </button>
        </div>

        {/* Cloud Access Info */}
        <div className="mt-8 p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-slate-200 font-bold mb-2">Lifetime Cloud Access</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your photos are securely stored in the cloud. You can download them anytime using your Job ID: <span className="text-slate-300 font-mono">{jobId}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
