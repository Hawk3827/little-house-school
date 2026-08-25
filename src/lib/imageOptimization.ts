/**
 * Helper to generate ultra-lightweight thumbnails and responsive image URLs.
 * Ensures instant page loads on slow 3G and regional mobile data networks.
 */

export function getThumbnailUrl(url?: string | null, width = 640, quality = 75): string {
  if (!url) return '/hero-bg.jpg';

  // If Cloudinary URL, inject automated WebP / AVIF transformation and low bandwidth optimization
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const parts = url.split('/upload/');
    const transformation = `f_auto,q_auto:eco,w_${width},c_limit`;
    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  }

  // Local / standard URL
  return url;
}

export function getFullResolutionUrl(url?: string | null): string {
  if (!url) return '/hero-bg.jpg';

  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const parts = url.split('/upload/');
    const transformation = `f_auto,q_auto:good,w_2560,c_limit`;
    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  }

  return url;
}
