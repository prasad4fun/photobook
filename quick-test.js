const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Collect all console messages and errors
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[ERROR] ${err.message}`));

  try {
    console.log('Opening http://localhost:3001...\n');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    // Wait a bit for app to load
    await page.waitForTimeout(3000);

    console.log('=== CONSOLE OUTPUT ===');
    logs.forEach(log => console.log(log));

    console.log('\n=== CHECKING PAGE STATE ===');

    // Check current URL and screen
    const url = page.url();
    console.log(`Current URL: ${url}`);

    // Check for photobook editor indicators
    const hasCanvas = await page.locator('canvas').isVisible().catch(() => false);
    const hasPixoryTitle = await page.locator('text=pixory').isVisible().catch(() => false);
    const hasImages = await page.locator('img[alt]').count();

    console.log(`Canvas visible: ${hasCanvas}`);
    console.log(`Pixory title: ${hasPixoryTitle}`);
    console.log(`Images found: ${hasImages}`);

    // If not in photobook editor, try to navigate there
    if (!hasPixoryTitle) {
      console.log('\n📍 Not in photobook editor, attempting navigation...');

      // Try clicking photobook button
      const photobookBtn = page.locator('button:has-text("📖"), button[title*="photobook"]').first();
      if (await photobookBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('Found photobook button, clicking...');
        await photobookBtn.click();
        await page.waitForTimeout(2000);
      } else {
        console.log('❌ Photobook button not found. Current state:');
        const bodyText = await page.locator('body').textContent();
        console.log(bodyText.substring(0, 500));
      }
    }

    console.log('\n⏳ Keeping browser open for manual inspection (60 seconds)...');
    console.log('Check the browser window to test functionality manually.\n');

    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
})();
