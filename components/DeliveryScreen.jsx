import React, { useState } from 'react';
import { Download, Package, Star, CheckCircle2, Share2, Home } from 'lucide-react';

export default function DeliveryScreen({ jobId, orderDetails, onStartNew }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleDownload = () => {
    // Simulate download
    alert('Download started! Your photos will be saved as a ZIP file.');
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Download Card */}
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
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-violet-500/30"
              >
                Download Now
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

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
