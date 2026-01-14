/**
 * Utility functions to generate Quran page image URLs
 * Using GitHub Pages - Verified Working and Fast
 */

/**
 * Get the CDN URL for a specific Quran page (PRIMARY - VERIFIED)
 * @param {number} page - Page number (1-604)
 * @returns {string} Full URL to the page image
 */
export const getPageImageUrl = (page) => {
  const paddedPage = String(page).padStart(3, '0');
  
  // Using GitHub Pages - Fast and Reliable
  return `https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${paddedPage}.png`;
};

/**
 * Alternative - GitHub Pages CDN (slightly slower but still good)
 */
export const getGitHubPagesUrl = (page) => {
  const paddedPage = String(page).padStart(3, '0');
  return `https://govarjabbar.github.io/Quran-PNG/${paddedPage}.png`;
};

/**
 * Get page URL with fallback options
 * @param {number} page - Page number (1-604)
 * @param {number} attempt - Which CDN to try (0 or 1)
 * @returns {string} URL to the page image
 */
export const getPageUrlWithFallback = (page, attempt = 0) => {
  const paddedPage = String(page).padStart(3, '0');
  
  const cdnOptions = [
    // Option 1: GitHub Raw (fastest)
    `https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${paddedPage}.png`,
    
    // Option 2: GitHub Pages (backup)
    `https://govarjabbar.github.io/Quran-PNG/${paddedPage}.png`,
  ];
  
  return cdnOptions[attempt % cdnOptions.length];
};