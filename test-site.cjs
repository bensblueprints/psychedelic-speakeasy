const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture ALL network responses
  const responses = [];
  page.on('response', async response => {
    if (response.url().includes('supabase') && response.url().includes('rest')) {
      try {
        const body = await response.text();
        responses.push({
          url: response.url().split('?')[0].replace('https://xhipdzbkigfwfctpviji.supabase.co/rest/v1/', ''),
          status: response.status(),
          body: body.substring(0, 500)
        });
      } catch (e) {}
    }
  });

  // Capture console messages
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  console.log('Navigating to login page...');
  await page.goto('https://psyspeak.netlify.app/login');
  await page.waitForTimeout(2000);

  console.log('Logging in as admin...');
  await page.fill('input[type="email"]', 'admin@speakeasy.com');
  await page.fill('input[type="password"]', 'JEsus777$$!');
  await page.click('button[type="submit"]');

  console.log('Waiting for dashboard to load...');
  await page.waitForTimeout(10000);

  console.log('Current URL:', page.url());

  // Take screenshot
  await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
  console.log('Screenshot saved');

  console.log('\n--- Database API Responses ---');
  responses.forEach(r => {
    console.log(`\n[${r.status}] ${r.url}`);
    console.log(`Data: ${r.body}`);
  });

  console.log('\n--- Console Errors ---');
  logs.filter(l => l.includes('error') || l.includes('Error')).forEach(log => console.log(log));

  await browser.close();
})();
