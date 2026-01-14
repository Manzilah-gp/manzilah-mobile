/**
 * Script to download all Quran pages from Internet Archive
 * Run: node downloadQuranPages.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOTAL_PAGES = 604;
const OUTPUT_DIR = './assets/quran-pages';

// Create directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✓ Created directory: assets/quran-pages\n');
}

/**
 * Download a single page image from Internet Archive
 */
const downloadPage = (pageNumber) => {
  return new Promise((resolve, reject) => {
    const paddedPage = String(pageNumber).padStart(3, '0');
    
    // CORRECT URL - Using Internet Archive
    const url = `https://ia802700.us.archive.org/18/items/ALQURANPERPAGEFORMATPNG/page${paddedPage}.png`;
    const outputPath = path.join(OUTPUT_DIR, `page${paddedPage}.png`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`✓ Page ${pageNumber}/${TOTAL_PAGES} - Already exists`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            console.error(`✗ Page ${pageNumber}/${TOTAL_PAGES} - Failed (${redirectResponse.statusCode})`);
            fs.unlinkSync(outputPath);
            reject(new Error(`Failed: ${redirectResponse.statusCode}`));
            return;
          }
          
          redirectResponse.pipe(file);
          
          file.on('finish', () => {
            file.close();
            console.log(`✓ Page ${pageNumber}/${TOTAL_PAGES} - Downloaded`);
            resolve();
          });
        }).on('error', (err) => {
          fs.unlinkSync(outputPath);
          console.error(`✗ Page ${pageNumber}/${TOTAL_PAGES} - Error:`, err.message);
          reject(err);
        });
        return;
      }

      if (response.statusCode !== 200) {
        console.error(`✗ Page ${pageNumber}/${TOTAL_PAGES} - Failed (${response.statusCode})`);
        fs.unlinkSync(outputPath);
        reject(new Error(`Failed: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Page ${pageNumber}/${TOTAL_PAGES} - Downloaded`);
        resolve();
      });
    }).on('error', (err) => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      console.error(`✗ Page ${pageNumber}/${TOTAL_PAGES} - Error:`, err.message);
      reject(err);
    });
  });
};

/**
 * Download all pages with delay between requests
 */
const downloadAllPages = async () => {
  console.log(`\n📖 Starting download of ${TOTAL_PAGES} Quran pages from Internet Archive...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    try {
      await downloadPage(i);
      successCount++;
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      failCount++;
    }
  }
  
  console.log(`\n✅ Download complete!`);
  console.log(`   Success: ${successCount}/${TOTAL_PAGES}`);
  console.log(`   Failed: ${failCount}/${TOTAL_PAGES}`);
  console.log(`   Location: ./assets/quran-pages/\n`);
};

downloadAllPages();