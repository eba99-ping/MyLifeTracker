import fs from 'node:fs';

const required = ['index.html','manifest.json','sw.js','vercel.json','favicon.svg','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','privacy.html','terms.html','about.html','contact.html','404.html'];
const missing = required.filter(file => !fs.existsSync(file));
if(missing.length) throw new Error(`Missing production files: ${missing.join(', ')}`);

JSON.parse(fs.readFileSync('manifest.json','utf8'));
JSON.parse(fs.readFileSync('vercel.json','utf8'));

const html = fs.readFileSync('index.html','utf8');
for(const marker of ['myLifeTracker.v5','myLifeTracker.profile.v1','myLifeTracker.session.v1','/manifest.json','/sw.js']) {
  if(!html.includes(marker)) throw new Error(`Required compatibility marker missing: ${marker}`);
}
if((html.match(/<script/g)||[]).length !== (html.match(/<\/script>/g)||[]).length) throw new Error('Unbalanced script tags in index.html');
if(!html.endsWith('</html>\n') && !html.endsWith('</html>')) throw new Error('index.html has an invalid ending');

console.log('Production file checks passed.');
