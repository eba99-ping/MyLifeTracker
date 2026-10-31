import fs from 'node:fs';

const required = ['index.html','manifest.json','sw.js','vercel.json','firebase.json','firestore.rules','.firebaserc','temuul-mark.png','icon-192.png','icon-512.png','icon-maskable-512.png','privacy.html','terms.html','about.html','contact.html','404.html','api/chat.js','functions/index.js','functions/reminder-logic.js'];
const missing = required.filter(file => !fs.existsSync(file));
if(!fs.existsSync('redesign.css')) missing.push('redesign.css');
for(const asset of ['games.css','games.js','games-core.js','growth.css','growth-core.js','temuul-logo.svg','motion.css','launch.css','pet-pixel.js','pet-motion.css','coach.css'])if(!fs.existsSync(asset))missing.push(asset);
if(missing.length) throw new Error(`Missing production files: ${missing.join(', ')}`);

JSON.parse(fs.readFileSync('manifest.json','utf8'));
JSON.parse(fs.readFileSync('vercel.json','utf8'));
JSON.parse(fs.readFileSync('firebase.json','utf8'));

const html = fs.readFileSync('index.html','utf8');
for(const marker of ['Тэмүүл','page-study','studyTimetable','STUDY_PERIODS','page-habits','habitModal','habitHeatmap','classModal','assignmentModal','pushDeliveryStatus','myLifeTracker.v5','myLifeTracker.profile.v1','myLifeTracker.session.v1','myLifeTracker.pet.v1','myLifeTracker.quests.v1','myLifeTracker.focus.v1','myLifeTracker.cloud.v1','myLifeTracker.reminders.v1','taskReminderTime','testNotification','data-snooze-reminder','taskPriority','data-journal-mood','weeklyInsightsTitle','/manifest.json','/sw.js']) {
  if(!html.includes(marker)) throw new Error(`Required compatibility marker missing: ${marker}`);
}
if((html.match(/<script/g)||[]).length !== (html.match(/<\/script>/g)||[]).length) throw new Error('Unbalanced script tags in index.html');
for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
  if(match[1].trim()) new Function(match[1]);
}
if(!html.endsWith('</html>\n') && !html.endsWith('</html>')) throw new Error('index.html has an invalid ending');

console.log('Production file checks passed.');
