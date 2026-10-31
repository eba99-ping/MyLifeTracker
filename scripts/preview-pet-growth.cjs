const fs=require('node:fs'),vm=require('node:vm');
const sharp=require(process.env.TEMUUL_SHARP_PATH||'sharp');
const context=vm.createContext({});vm.runInContext(fs.readFileSync('pet-pixel.js','utf8'),context);
const stages=[[0,'Baby · Level 1'],[420,'Junior · Level 4'],[1260,'Adult · Level 7']];
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="780" height="310" viewBox="0 0 780 310"><rect width="780" height="310" rx="24" fill="#171a2a"/>${stages.map(([xp,label],i)=>`<g transform="translate(${25+i*250} 25)"><rect width="230" height="260" rx="20" fill="#24263a"/><svg x="15" y="10" width="200" height="205" viewBox="0 0 200 205">${context.TemuulPixelPet.artwork({shape:'cat',color:'#e6a563',xp,accessory:'none'})}</svg><text x="115" y="240" fill="#eee8ff" font-family="sans-serif" font-size="16" text-anchor="middle">${label}</text></g>`).join('')}</svg>`;
sharp(Buffer.from(svg)).png().toFile(process.argv[2]||'pet-growth-preview.png');
