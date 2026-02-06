import { OrderDetails, Theme } from '../types';
import { analytics } from '../utils/analytics';

/**
 * Create an order (mock implementation - replace with real backend)
 */
export async function createOrder(
  _jobId: string,
  theme: Theme,
  packageType: 'digital' | 'photobook',
  imageCount: number
): Promise<OrderDetails> {
  // Track order creation
  analytics.packageSelected(packageType);

  const order: OrderDetails = {
    package: packageType,
    price: packageType === 'digital' ? 999 : 2499,
    imageCount,
    theme,
  };

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  analytics.orderConfirmed(order.price);

  return order;
}

/**
 * Get order status (mock implementation)
 */
export async function getOrderStatus(_jobId: string): Promise<{
  status: 'pending' | 'processing' | 'completed';
  progress: number;
}> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    status: 'processing',
    progress: 75,
  };
}

/**
 * Get download URL for completed order (mock implementation)
 */
export async function getDownloadUrl(jobId: string): Promise<string> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 200));

  // In production, this would return a signed S3 URL or similar
  return `https://example.com/downloads/${jobId}.zip`;
}

/**
 * Submit feedback (mock implementation)
 */
export async function submitFeedback(
  jobId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  analytics.feedbackSubmitted(rating);

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Feedback submitted:', { jobId, rating, feedback });
}
