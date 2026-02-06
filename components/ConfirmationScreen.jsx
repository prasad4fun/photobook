import React, { useState } from 'react';
import { ArrowLeft, Check, Package, Download, CreditCard, Sparkles } from 'lucide-react';

export default function ConfirmationScreen({ selectedTheme, imageCount, onConfirm, onBack }) {
  const [selectedPackage, setSelectedPackage] = useState('digital');
  const [isProcessing, setIsProcessing] = useState(false);

  const packages = {
    digital: {
      id: 'digital',
      name: 'Digital Only',
      price: 999,
      features: [
        'All edited photos in high resolution',
        'Digital ZIP download',
        'Instant delivery after processing',
        'Lifetime cloud access'
      ],
      icon: Download
    },
    photobook: {
      id: 'photobook',
      name: 'Digital + Photobook',
      price: 2499,
      features: [
        'Everything in Digital package',
        'Premium printed photobook',
        'Professional binding',
        'Delivered to your doorstep'
      ],
      icon: Package,
      badge: 'Popular'
    }
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm({
        package: selectedPackage,
        price: packages[selectedPackage].price,
        imageCount,
        theme: selectedTheme
      });
    }, 1500);
  };

  const selectedPkg = packages[selectedPackage];

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Themes</span>
          </button>

          <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text mb-4">
            Confirm Your Order
          </h2>
          <p className="text-slate-400 text-xl">
            Review your selection and choose a package
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Theme Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="p-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl mb-6">
                <h3 className="text-sm text-slate-500 uppercase tracking-wider mb-3">Selected Theme</h3>
                <h4 className="text-2xl font-black text-violet-300 mb-4">{selectedTheme.name}</h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-500">Mood:</span>
                    <span className="text-slate-300 ml-2 font-medium">{selectedTheme.mood}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Lighting:</span>
                    <span className="text-slate-300 ml-2 font-medium">{selectedTheme.lighting}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Style:</span>
                    <span className="text-slate-300 ml-2 font-medium">{selectedTheme.editing_style}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
                <h3 className="text-sm text-slate-500 uppercase tracking-wider mb-3">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Images</span>
                    <span className="text-slate-200 font-semibold">{imageCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Time</span>
                    <span className="text-slate-200 font-semibold">~20 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Package Selection */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-slate-200 mb-6">Choose Your Package</h3>

            <div className="space-y-4 mb-8">
              {Object.values(packages).map((pkg) => {
                const PkgIcon = pkg.icon;
                const isSelected = selectedPackage === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`relative cursor-pointer transition-all duration-300 ${
                      isSelected ? 'scale-102' : 'hover:scale-101'
                    }`}
                  >
                    <div
                      className={`p-6 rounded-2xl border-2 backdrop-blur-sm transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border-violet-500/50 shadow-xl'
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      {/* Badge */}
                      {pkg.badge && (
                        <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg">
                          {pkg.badge}
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-6 h-6 text-white" strokeWidth={3} />
                        </div>
                      )}

                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30'
                            : 'bg-slate-700/50'
                        }`}>
                          <PkgIcon className={`w-7 h-7 ${isSelected ? 'text-violet-300' : 'text-slate-400'}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-slate-100 mb-1">{pkg.name}</h4>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-black text-slate-100">₹{pkg.price}</div>
                            </div>
                          </div>

                          {/* Features */}
                          <ul className="space-y-2">
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                  isSelected ? 'text-violet-400' : 'text-slate-500'
                                }`} />
                                <span className={isSelected ? 'text-slate-300' : 'text-slate-400'}>
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="p-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl mb-8">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Price Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-400">
                  <span>{selectedPkg.name}</span>
                  <span>₹{selectedPkg.price}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Processing ({imageCount} images)</span>
                  <span className="text-emerald-400">Included</span>
                </div>
                <div className="h-px bg-slate-700"></div>
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-slate-200">Total</span>
                  <span className="text-violet-300">₹{selectedPkg.price}</span>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
                isProcessing
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-102 shadow-xl shadow-violet-500/30'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  Pay & Continue
                </span>
              )}
            </button>

            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Secure Payment</span>
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Studio Reviewed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
