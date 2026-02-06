import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function UploadScreen({ onComplete, onBack }) {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, ready, error

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(file => 
      file.type === 'image/jpeg' || file.type === 'image/png'
    );

    if (validFiles.length === 0) {
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');

    // Simulate upload with compression
    const newImages = validFiles.map((file, idx) => ({
      id: `img_${Date.now()}_${idx}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setTimeout(() => {
      setImages(prev => [...prev, ...newImages]);
      setUploadStatus('ready');
    }, 800);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = (e) => {
    processFiles(e.target.files);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (images.length <= 1) {
      setUploadStatus('idle');
    }
  };

  const handleAnalyze = () => {
    if (images.length >= 5 && images.length <= 30) {
      onComplete(images);
    }
  };

  const isValidCount = images.length >= 5 && images.length <= 30;

  return (
    <div className="min-h-screen flex flex-col px-6 py-12">
      {/* Header */}
      <div className="max-w-5xl w-full mx-auto mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text mb-3">
          Upload Your Photos
        </h2>
        <p className="text-slate-400 text-lg">
          Upload 5–30 images to get started. We support JPEG and PNG formats.
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-5xl w-full mx-auto flex-1">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ${
            isDragging
              ? 'border-violet-400 bg-violet-500/10 scale-[1.02]'
              : 'border-slate-700 bg-slate-800/30 backdrop-blur-sm'
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />

          {images.length === 0 ? (
            <label
              htmlFor="file-input"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
                <Upload className="w-12 h-12 text-violet-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-200 mb-2">
                Drop your photos here
              </h3>
              <p className="text-slate-400 mb-6">or click to browse</p>
              <div className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold text-white transition-colors">
                Choose Files
              </div>
            </label>
          ) : (
            <div>
              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 group"
                  >
                    <img
                      src={img.preview}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}

                {/* Add More Button */}
                {images.length < 30 && (
                  <label
                    htmlFor="file-input"
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-600 hover:border-violet-400 bg-slate-800/50 hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-all"
                  >
                    <Upload className="w-8 h-8 text-slate-500" />
                  </label>
                )}
              </div>

              {/* Counter and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-slate-300">
                    <span className={`text-3xl font-bold ${isValidCount ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {images.length}
                    </span>
                    <span className="text-slate-500 ml-2">/ 30 images</span>
                  </div>
                  
                  {!isValidCount && images.length < 5 && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Upload at least 5 images</span>
                    </div>
                  )}
                  
                  {isValidCount && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready to analyze</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!isValidCount}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                    isValidCount
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-105 shadow-lg shadow-violet-500/30'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Analyze Photos
                </button>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'uploading' && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-300 font-semibold">Uploading & compressing...</p>
              </div>
            </div>
          )}
        </div>

        {/* File Type Hint */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>JPEG, PNG supported</span>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <div>Client-side compression enabled</div>
        </div>
      </div>
    </div>
  );
}
