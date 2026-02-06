const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    args: ['--disable-web-security'] // Allow CORS for local testing
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(text);
    console.log(text);
  });

  page.on('pageerror', err => {
    const text = `[ERROR] ${err.message}`;
    consoleLogs.push(text);
    console.error(text);
  });

  try {
    console.log('\n🚀 Starting comprehensive photobook editor test...\n');

    // Step 1: Go to landing page
    console.log('Step 1: Loading landing page...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/01-landing.png' });

    // Step 2: Click "Start Photo Experience"
    console.log('\nStep 2: Clicking "Start Photo Experience"...');
    const startBtn = page.locator('button:has-text("Start Photo Experience")');
    if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/02-after-start.png' });
    } else {
      console.log('❌ Start button not found');
    }

    // Step 3: Create test images (base64 encoded 1x1 pixel images)
    console.log('\nStep 3: Preparing test images...');

    // Small test image (1x1 red pixel)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    // Try to trigger file input programmatically
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ File input found');

      // Create temporary test images
      const tempDir = path.join(__dirname, 'temp-test-images');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      // Create 5 small test image files
      const testFiles = [];
      for (let i = 1; i <= 5; i++) {
        const filePath = path.join(tempDir, `test-image-${i}.png`);

        // Create a simple PNG file
        const base64Data = testImageData.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        testFiles.push(filePath);
      }

      console.log(`📁 Created ${testFiles.length} test image files`);

      // Set files on input
      await fileInput.setInputFiles(testFiles);
      await page.waitForTimeout(3000);

      console.log('✅ Files uploaded');
      await page.screenshot({ path: 'screenshots/03-after-upload.png' });

      // Clean up temp files
      testFiles.forEach(f => fs.unlinkSync(f));
      fs.rmdirSync(tempDir);

    } else {
      console.log('⚠️  Skipping file upload - using session state if available');
    }

    // Step 4: Wait for analysis or theme screen
    console.log('\nStep 4: Waiting for theme selection...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/04-theme-screen.png' });

    // Step 5: Click photobook button (📖)
    console.log('\nStep 5: Looking for photobook button...');
    const photobookBtn = page.locator('button:has-text("📖"), button[title*="photobook"], button[title*="Create"]').first();

    if (await photobookBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Found photobook button');
      await photobookBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshots/05-photobook-editor.png', fullPage: true });
    } else {
      console.log('⚠️  Photobook button not found, trying alternative navigation...');

      // Try clicking any theme card
      const themeCard = page.locator('[class*="theme"], [class*="card"]').first();
      if (await themeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await themeCard.click();
        await page.waitForTimeout(2000);
      }
    }

    // Step 6: Verify we're in photobook editor
    console.log('\n=== PHOTOBOOK EDITOR TESTS ===\n');

    const hasCanvas = await page.locator('canvas').isVisible().catch(() => false);
    const hasPixory = await page.locator('text=/pixory/i').isVisible().catch(() => false);

    console.log(`Canvas visible: ${hasCanvas ? '✅' : '❌'}`);
    console.log(`Pixory branding: ${hasPixory ? '✅' : '❌'}`);

    if (!hasCanvas) {
      console.log('\n❌ Not in photobook editor. Current URL:', page.url());
      await page.screenshot({ path: 'screenshots/06-current-state.png', fullPage: true });

      console.log('\n⏳ Keeping browser open for 60 seconds for manual navigation...');
      console.log('Please manually navigate to the photobook editor in the browser window.\n');
      await page.waitForTimeout(60000);

      // Recheck after manual navigation
      const hasCanvasNow = await page.locator('canvas').isVisible().catch(() => false);
      if (hasCanvasNow) {
        console.log('✅ Canvas now visible after manual navigation!');
      }
    }

    // Test 7: Test image sidebar
    console.log('\nTest 7: Checking image sidebar...');
    const sidebarImages = await page.locator('img[alt]').count();
    console.log(`  Found ${sidebarImages} images in sidebar`);

    // Test 8: Click first image (click the button wrapper, not the img directly)
    console.log('\nTest 8: Clicking first image...');
    const firstImgButton = page.locator('button:has(img[alt])').first();
    if (await firstImgButton.isVisible().catch(() => false)) {
      await firstImgButton.click();
      await page.waitForTimeout(1000);
      console.log('  ✅ Clicked first image button');
      await page.screenshot({ path: 'screenshots/07-after-image-click.png', fullPage: true });

      // Check console for our debug logs
      const hasDebugLogs = consoleLogs.some(log => log.includes('📸 Image clicked'));
      console.log(`  Debug logs present: ${hasDebugLogs ? '✅' : '❌'}`);
    }

    // Test 9: Click Smart Creation
    console.log('\nTest 9: Testing Smart Creation...');
    const smartBtn = page.locator('button:has-text("Smart Creation")');
    if (await smartBtn.isVisible().catch(() => false)) {
      await smartBtn.click();
      await page.waitForTimeout(500);

      // Check for dialog
      const hasDialog = await page.locator('text=/generate|create|confirm/i').isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`  Confirmation dialog: ${hasDialog ? '✅' : '❌'}`);

      if (hasDialog) {
        // Try to click confirm/yes button
        const confirmBtn = page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("OK")').first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(3000);
          console.log('  ✅ Smart Creation triggered');
          await page.screenshot({ path: 'screenshots/08-after-smart-creation.png', fullPage: true });
        }
      }
    }

    // Test 10: Check canvas elements
    console.log('\nTest 10: Checking canvas for rendered elements...');
    await page.waitForTimeout(1000);

    // Count canvas elements by checking if images were added
    const canvasImages = consoleLogs.filter(log => log.includes('🎨 Rendering') && log.includes('elements'));
    console.log(`  Canvas render calls: ${canvasImages.length}`);

    if (canvasImages.length > 0) {
      console.log('  Latest render:', canvasImages[canvasImages.length - 1]);
    }

    // Final screenshot
    await page.screenshot({ path: 'screenshots/09-final-state.png', fullPage: true });

    // Summary
    console.log('\n=== TEST SUMMARY ===\n');
    console.log('Console Logs Summary:');
    const imageClickLogs = consoleLogs.filter(log => log.includes('📸 Image clicked'));
    const elementCreatedLogs = consoleLogs.filter(log => log.includes('🖼️  Created image element'));
    const renderLogs = consoleLogs.filter(log => log.includes('🎨 Rendering'));
    const errorLogs = consoleLogs.filter(log => log.includes('[ERROR]') || log.includes('[error]'));

    console.log(`  Image clicks detected: ${imageClickLogs.length}`);
    console.log(`  Elements created: ${elementCreatedLogs.length}`);
    console.log(`  Render calls: ${renderLogs.length}`);
    console.log(`  Errors: ${errorLogs.length}`);

    if (errorLogs.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errorLogs.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n📁 Screenshots saved to screenshots/ directory');
    console.log('\n⏳ Keeping browser open for manual testing (30 seconds)...\n');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/error-state.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Test complete!');
  }
})();
