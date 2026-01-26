const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console messages
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[ERROR] ${err.message}`));

  console.log('Navigating to login page...');
  await page.goto('https://psyspeak.netlify.app/login');
  await page.waitForTimeout(2000);

  console.log('Logging in as admin...');
  await page.fill('input[type="email"]', 'admin@speakeasy.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');

  console.log('Waiting for navigation...');
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());

  // Take screenshot
  await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
  console.log('Screenshot saved to dashboard-screenshot.png');

  console.log('\n--- Console Logs ---');
  logs.forEach(log => console.log(log));

  await browser.close();
})();
