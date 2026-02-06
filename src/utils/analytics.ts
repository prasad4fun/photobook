import { GA_TRACKING_ID } from './constants';

// Track page views
export function trackPageView(pageName: string) {
  if (!GA_TRACKING_ID) return;

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: `/${pageName}`,
    });
  }

  console.log(`[Analytics] Page view: ${pageName}`);
}

// Track events
export function trackEvent(
  eventName: string,
  category: string,
  label?: string,
  value?: number
) {
  if (!GA_TRACKING_ID) return;

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  console.log(`[Analytics] Event: ${eventName}`, { category, label, value });
}

// Specific tracking functions
export const analytics = {
  // Upload events
  imagesUploaded: (count: number) =>
    trackEvent('images_uploaded', 'upload', `${count}_images`, count),

  // Analysis events
  analysisStarted: (jobId: string) =>
    trackEvent('analysis_started', 'analysis', jobId),
  analysisCompleted: (jobId: string, duration: number) =>
    trackEvent('analysis_completed', 'analysis', jobId, duration),

  // Theme selection
  themeSelected: (themeId: string) =>
    trackEvent('theme_selected', 'theme', themeId),

  // Order events
  packageSelected: (packageType: 'digital' | 'photobook') =>
    trackEvent('package_selected', 'order', packageType),
  orderConfirmed: (amount: number) =>
    trackEvent('order_confirmed', 'order', 'payment', amount),

  // Delivery events
  downloadClicked: () =>
    trackEvent('download_clicked', 'delivery', 'zip_download'),
  feedbackSubmitted: (rating: number) =>
    trackEvent('feedback_submitted', 'delivery', 'rating', rating),

  // Studio events
  studioLogin: () =>
    trackEvent('studio_login', 'studio', 'dashboard_access'),
  jobApproved: (jobId: string) =>
    trackEvent('job_approved', 'studio', jobId),

  // Error tracking
  errorOccurred: (errorType: string, message: string) =>
    trackEvent('error_occurred', 'error', `${errorType}: ${message}`),
};
