const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.BASELINE_BROWSER || undefined,args:['--no-sandbox']});
for(const width of [375,1280]) for(const theme of ['light','dark']) {
 const context=await browser.newContext({viewport:{width,height:900},timezoneId:'America/New_York'});
 const page=await context.newPage();
 await page.addInitScript(t=>localStorage.setItem('halfstep-theme',t),theme);
 await page.goto(process.env.BASELINE_URL || 'http://127.0.0.1:5176'); await page.evaluate(()=>document.fonts.ready);
 const shot=async name=>{await page.waitForTimeout(350);await page.screenshot({path:`design-standards/examples/baseline/${width}-${theme}-${name}.png`,fullPage:true});};
 await shot('calculator-empty');
 await page.locator('#input-glucose').fill('185'); await page.locator('#input-carbs').fill('35'); await shot('calculator-valid');
 await page.locator('#input-glucose').fill('65'); await shot('calculator-low');
 await page.getByRole('button',{name:'Prescribed clinical settings (Locked)',exact:true}).click(); await shot('settings'); await page.keyboard.press('Escape');
 await page.getByRole('button',{name:/Estimated IOB from this device/}).click(); await shot('iob-empty'); await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Injection History',exact:true}).click(); await shot('history-empty');
 await page.getByRole('button',{name:'Record Insulin Given',exact:true}).click();
 await page.locator('#history-dose-units').fill('1.5'); await page.locator('#history-caregiver').fill('Example caregiver'); await shot('form');
 await page.getByRole('button',{name:'Review Entry',exact:true}).click(); await shot('confirmation');
 await page.getByRole('button',{name:'Confirm and Save',exact:true}).click(); await page.locator('.history-row').first().waitFor(); await shot('history-active');
 await page.locator('.history-row').first().click(); await page.getByRole('button',{name:'Void Entry',exact:true}).click(); await shot('void-confirmation');
 await page.getByRole('button',{name:'Close Injection History',exact:true}).click();
 await page.getByRole('button',{name:/Estimated IOB from this device/}).click(); await shot('iob-active');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Injection History',exact:true}).click();
 await page.getByRole('button',{name:'Record Insulin Given',exact:true}).click();
 await page.locator('#history-dose-units').fill('0.5'); await page.locator('#history-caregiver').fill('Example caregiver');
 await page.getByRole('button',{name:'Review Entry',exact:true}).click(); await page.getByRole('button',{name:'Confirm and Save',exact:true}).click(); await page.locator('.history-row').nth(1).waitFor();
 await page.getByRole('button',{name:'Close Injection History',exact:true}).click();
 await page.getByRole('button',{name:/Estimated IOB from this device/}).click(); await shot('iob-overlap');
 await context.close();
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
