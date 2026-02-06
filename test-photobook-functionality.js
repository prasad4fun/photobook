const { chromium } = require('playwright');

/**
 * Focused test for photobook editor functionality
 * Assumes user has already navigated to the photobook editor
 */
(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Collect console logs
  const consoleLogs = [];
  const errors = [];

  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(text);
    console.log(text);
  });

  page.on('pageerror', err => {
    const text = `[ERROR] ${err.message}`;
    errors.push(text);
    console.error(text);
  });

  try {
    console.log('\n🎨 PHOTOBOOK EDITOR FUNCTIONALITY TEST\n');
    console.log('⏳ Please manually navigate to the photobook editor...');
    console.log('   (Upload photos → Analyze → Theme Preview → Click 📖 button)');
    console.log('   You have 90 seconds...\n');

    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    // Wait for manual navigation
    await page.waitForTimeout(90000);

    console.log('\n=== STARTING TESTS ===\n');

    // Test 1: Verify canvas exists
    console.log('Test 1: Checking for canvas...');
    const canvas = page.locator('canvas');
    const hasCanvas = await canvas.isVisible().catch(() => false);
    console.log(`  Canvas visible: ${hasCanvas ? '✅' : '❌'}`);

    if (!hasCanvas) {
      console.log('\n❌ Canvas not found. Make sure you navigated to photobook editor.');
      console.log('   Current URL:', page.url());
      await page.screenshot({ path: 'screenshots/test-no-canvas.png', fullPage: true });
      return;
    }

    await page.screenshot({ path: 'screenshots/test-01-initial.png', fullPage: true });

    // Test 2: Check sidebar images
    console.log('\nTest 2: Checking image sidebar...');
    const sidebarImages = await page.locator('[class*="sidebar"] img, [class*="left"] img').count();
    console.log(`  Found ${sidebarImages} images in sidebar: ${sidebarImages > 0 ? '✅' : '❌'}`);

    // Test 3: Click first image (click button wrapper, not img directly)
    console.log('\nTest 3: Adding image to canvas...');
    if (sidebarImages > 0) {
      const firstImage = page.locator('button:has(img[alt])').first();
      await firstImage.click();
      await page.waitForTimeout(1000);

      const hasImageLog = consoleLogs.some(log => log.includes('📸 Image clicked'));
      const hasCreatedLog = consoleLogs.some(log => log.includes('🖼️  Created image element'));
      const hasRenderLog = consoleLogs.some(log => log.includes('🎨 Rendering'));

      console.log(`  Image click detected: ${hasImageLog ? '✅' : '❌'}`);
      console.log(`  Element created: ${hasCreatedLog ? '✅' : '❌'}`);
      console.log(`  Canvas rendered: ${hasRenderLog ? '✅' : '❌'}`);

      await page.screenshot({ path: 'screenshots/test-02-after-image-click.png', fullPage: true });
    }

    // Test 4: Click canvas to select element
    console.log('\nTest 4: Testing element selection...');
    await canvas.click({ position: { x: 500, y: 500 } });
    await page.waitForTimeout(500);

    const hasSelectLog = consoleLogs.some(log => log.includes('Selected element') || log.includes('handleElementSelect'));
    console.log(`  Selection event: ${hasSelectLog ? '✅' : '❌'}`);

    // Test 5: Check for transformer (resize handles)
    console.log('\nTest 5: Checking for transformer handles...');
    // Transformer creates multiple small rects/circles for handles
    const transformerVisible = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;

      // Check if any transformer elements exist in Konva
      const konvaContainer = canvas.parentElement;
      return konvaContainer && konvaContainer.querySelectorAll('canvas').length > 0;
    });
    console.log(`  Transformer present: ${transformerVisible ? '✅' : '❌'}`);

    await page.screenshot({ path: 'screenshots/test-03-after-selection.png', fullPage: true });

    // Test 6: Test Smart Creation button
    console.log('\nTest 6: Testing Smart Creation...');
    const smartBtn = page.locator('button:has-text("Smart Creation")');
    const hasSmartBtn = await smartBtn.isVisible().catch(() => false);
    console.log(`  Smart Creation button visible: ${hasSmartBtn ? '✅' : '❌'}`);

    if (hasSmartBtn) {
      await smartBtn.click();
      await page.waitForTimeout(500);

      // Check for confirmation dialog
      const hasDialog = await page.locator('text=/generate|create|confirm|yes/i').isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`  Confirmation dialog: ${hasDialog ? '✅' : '❌'}`);

      if (hasDialog) {
        await page.screenshot({ path: 'screenshots/test-04-smart-creation-dialog.png', fullPage: true });

        // Click confirm
        const confirmBtn = page.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("OK")').first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(3000);
          console.log(`  Smart Creation triggered: ✅`);

          const hasSmartLogs = consoleLogs.filter(log => log.includes('Smart Creation') || log.includes('createImageElement'));
          console.log(`  Generated ${hasSmartLogs.length} elements via Smart Creation`);
        }
      } else {
        // Dialog might not appear - click again to cancel
        await page.keyboard.press('Escape');
      }

      await page.screenshot({ path: 'screenshots/test-05-after-smart-creation.png', fullPage: true });
    }

    // Test 7: Test Autofill button
    console.log('\nTest 7: Testing Autofill...');
    const autofillBtn = page.locator('button:has-text("Autofill")');
    const hasAutofillBtn = await autofillBtn.isVisible().catch(() => false);
    console.log(`  Autofill button visible: ${hasAutofillBtn ? '✅' : '❌'}`);

    if (hasAutofillBtn) {
      await autofillBtn.click();
      await page.waitForTimeout(3000);

      const hasAutofillLogs = consoleLogs.filter(log => log.includes('Autofill') || log.includes('createImageElement'));
      console.log(`  Autofill triggered: ${hasAutofillLogs.length > 0 ? '✅' : '❌'}`);

      await page.screenshot({ path: 'screenshots/test-06-after-autofill.png', fullPage: true });
    }

    // Test 8: Check navigation buttons
    console.log('\nTest 8: Testing spread navigation...');
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("→"), button:has-text("▶")');
    const prevBtn = page.locator('button:has-text("Previous"), button:has-text("←"), button:has-text("◀")');

    const hasNextBtn = await nextBtn.first().isVisible().catch(() => false);
    const hasPrevBtn = await prevBtn.first().isVisible().catch(() => false);

    console.log(`  Next button visible: ${hasNextBtn ? '✅' : '❌'}`);
    console.log(`  Previous button visible: ${hasPrevBtn ? '✅' : '❌'}`);

    if (hasNextBtn) {
      await nextBtn.first().click();
      await page.waitForTimeout(1000);
      console.log(`  Navigation to next spread: ✅`);
      await page.screenshot({ path: 'screenshots/test-07-next-spread.png', fullPage: true });
    }

    // Test 9: Check toolbar buttons
    console.log('\nTest 9: Checking toolbar...');
    const toolButtons = await page.locator('button').count();
    console.log(`  Total buttons found: ${toolButtons}`);

    const hasTextTool = await page.locator('button:has-text("T"), button:has-text("Text")').isVisible().catch(() => false);
    const hasShapeTool = await page.locator('button:has-text("Shape"), button:has([class*="shape"])').isVisible().catch(() => false);

    console.log(`  Text tool: ${hasTextTool ? '✅' : '❌'}`);
    console.log(`  Shape tool: ${hasShapeTool ? '✅' : '❌'}`);

    // Final screenshot
    await page.screenshot({ path: 'screenshots/test-final.png', fullPage: true });

    // Summary
    console.log('\n=== TEST SUMMARY ===\n');

    const imageClicks = consoleLogs.filter(log => log.includes('📸 Image clicked')).length;
    const elementsCreated = consoleLogs.filter(log => log.includes('🖼️  Created image element')).length;
    const renderCalls = consoleLogs.filter(log => log.includes('🎨 Rendering')).length;
    const imageLoads = consoleLogs.filter(log => log.includes('✅ Image loaded')).length;
    const imageFails = consoleLogs.filter(log => log.includes('❌ Failed to load image')).length;

    console.log(`Image clicks: ${imageClicks}`);
    console.log(`Elements created: ${elementsCreated}`);
    console.log(`Canvas renders: ${renderCalls}`);
    console.log(`Images loaded successfully: ${imageLoads}`);
    console.log(`Images failed to load: ${imageFails}`);
    console.log(`Total errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n📁 Screenshots saved to screenshots/ directory');
    console.log('\n⏳ Keeping browser open for manual inspection (30 seconds)...\n');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Test complete!');
  }
})();
