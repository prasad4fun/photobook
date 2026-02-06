const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🚀 Navigating to localhost:3001...');
  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');

  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/01-landing.png', fullPage: true });
  console.log('📸 Screenshot: Landing page');

  // Check if we're already in the photobook editor
  const isInEditor = await page.locator('text=pixory').isVisible().catch(() => false);

  if (isInEditor) {
    console.log('✅ Already in photobook editor!');
  } else {
    console.log('📍 Navigating to photobook editor...');

    // Click "Start Photo Experience" button
    const startButton = page.locator('button:has-text("Start Photo Experience")');
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/02-after-start.png', fullPage: true });
    }

    // Look for photobook editor button (📖 icon)
    await page.waitForTimeout(1000);
    const photobookButton = page.locator('button[title="Create custom photobook"], button:has-text("📖")').first();
    if (await photobookButton.isVisible().catch(() => false)) {
      console.log('🔍 Found photobook button, clicking...');
      await photobookButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/03-photobook-editor.png', fullPage: true });
    }
  }

  console.log('\n=== Testing Photobook Editor Functionality ===\n');

  // Test 1: Check if main UI zones are visible
  console.log('Test 1: Checking UI zones...');
  const zones = {
    'Top Toolbar': 'button:has-text("Undo"), button:has-text("Save"), button:has-text("Order")',
    'Left Sidebar': 'text=Images, text=Smart Creation',
    'Element Toolbar': 'button[title*="Text"], button[title*="Photo"]',
    'Canvas': 'canvas',
    'Page Thumbnails': 'text=Cover, button:has-text("Add Pages")',
  };

  for (const [zone, selector] of Object.entries(zones)) {
    const isVisible = await page.locator(selector.split(',')[0]).isVisible().catch(() => false);
    console.log(`  ${isVisible ? '✅' : '❌'} ${zone}`);
  }

  // Test 2: Check if images are loaded in sidebar
  console.log('\nTest 2: Checking sidebar images...');
  const imageCount = await page.locator('img[alt*="photo"], img[alt*="image"]').count();
  console.log(`  Found ${imageCount} images in sidebar`);

  // Test 3: Test Smart Creation button
  console.log('\nTest 3: Testing Smart Creation button...');
  const smartCreationBtn = page.locator('button:has-text("Smart Creation")');
  if (await smartCreationBtn.isVisible().catch(() => false)) {
    console.log('  ✅ Smart Creation button visible');
    await smartCreationBtn.click();
    await page.waitForTimeout(1000);

    // Check for confirmation dialog
    const hasDialog = await page.locator('text=Smart Creation, text=generate').isVisible().catch(() => false);
    console.log(`  ${hasDialog ? '✅' : '❌'} Confirmation dialog appeared`);

    if (hasDialog) {
      // Click Cancel to dismiss
      const cancelBtn = page.locator('button:has-text("Cancel")');
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
      }
    }
  } else {
    console.log('  ❌ Smart Creation button not found');
  }

  // Test 4: Test clicking an image from sidebar
  console.log('\nTest 4: Testing image click...');
  const firstImage = page.locator('img[alt*="photo"], img[alt*="image"]').first();
  if (await firstImage.isVisible().catch(() => false)) {
    await firstImage.click();
    await page.waitForTimeout(1000);
    console.log('  ✅ Clicked first image');
    await page.screenshot({ path: 'screenshots/04-after-image-click.png', fullPage: true });
  } else {
    console.log('  ❌ No images to click');
  }

  // Test 5: Test element tools
  console.log('\nTest 5: Testing element tools...');
  const tools = ['Text', 'Rectangle', 'Ellipse'];
  for (const tool of tools) {
    const toolBtn = page.locator(`button[title*="${tool}"]`);
    if (await toolBtn.isVisible().catch(() => false)) {
      await toolBtn.click();
      await page.waitForTimeout(300);
      console.log(`  ✅ ${tool} tool clicked`);
    } else {
      console.log(`  ❌ ${tool} tool not found`);
    }
  }

  // Test 6: Test canvas click
  console.log('\nTest 6: Testing canvas click...');
  const canvas = page.locator('canvas').first();
  if (await canvas.isVisible().catch(() => false)) {
    const box = await canvas.boundingBox();
    if (box) {
      // Click in the middle of the canvas
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
      console.log('  ✅ Clicked canvas');
      await page.screenshot({ path: 'screenshots/05-after-canvas-click.png', fullPage: true });
    }
  } else {
    console.log('  ❌ Canvas not found');
  }

  // Test 7: Test Undo/Redo
  console.log('\nTest 7: Testing Undo/Redo...');
  const undoBtn = page.locator('button:has-text("Undo")');
  const redoBtn = page.locator('button:has-text("Redo")');

  if (await undoBtn.isVisible().catch(() => false)) {
    const isDisabled = await undoBtn.getAttribute('disabled');
    console.log(`  Undo button: ${isDisabled ? 'disabled' : 'enabled'}`);
  }

  if (await redoBtn.isVisible().catch(() => false)) {
    const isDisabled = await redoBtn.getAttribute('disabled');
    console.log(`  Redo button: ${isDisabled ? 'disabled' : 'enabled'}`);
  }

  // Test 8: Test page navigation
  console.log('\nTest 8: Testing page navigation...');
  const thumbnails = await page.locator('text=Cover, text=Page').count();
  console.log(`  Found ${thumbnails} page indicators`);

  // Test 9: Check console errors
  console.log('\nTest 9: Checking console errors...');
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.waitForTimeout(2000);

  if (errors.length > 0) {
    console.log('  ❌ Console errors found:');
    errors.forEach(err => console.log(`     - ${err}`));
  } else {
    console.log('  ✅ No console errors');
  }

  // Final screenshot
  await page.screenshot({ path: 'screenshots/06-final-state.png', fullPage: true });

  console.log('\n=== Test Complete ===');
  console.log('📁 Screenshots saved to screenshots/ directory');

  // Keep browser open for 30 seconds for manual inspection
  console.log('\n⏳ Keeping browser open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
})();
