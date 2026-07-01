const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.log(`[pageError] ${error.message}`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[console] [${msg.type()}] ${msg.text()}`);
    }
  });

  await page.goto('http://localhost:5174/distribuicoes');
  
  // Wait for the components to load
  await page.waitForSelector('.mantine-Slider-thumb');
  
  const slider = await page.$('.mantine-Slider-track');
  if (slider) {
    const box = await slider.boundingBox();
    if (box) {
      // Simulate rapid dragging
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      for (let i = 0; i < 30; i++) {
         let targetX = box.x + (box.width * Math.random());
         await page.mouse.move(targetX, box.y + box.height / 2, { steps: 2 });
      }
      await page.mouse.up();
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
  console.log("Test finished.");
})();
