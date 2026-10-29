const fs=require('node:fs');
const vm=require('node:vm');
const sharp=require(process.env.TEMUUL_SHARP_PATH||'sharp');
const context=vm.createContext({});vm.runInContext(fs.readFileSync('pet-pixel.js','utf8'),context);
const pets=[['cat','#e6a563','Cat'],['bunny','#a48de3','Bunny'],['bear','#b58560','Bear'],['panda','#8b72ff','Panda']];
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="310" viewBox="0 0 1000 310"><rect width="1000" height="310" rx="24" fill="#171a2a"/>${pets.map(([shape,color,name],i)=>`<g transform="translate(${25+i*245} 30)"><rect width="220" height="250" rx="18" fill="#24263a"/><svg x="10" y="8" width="200" height="205" viewBox="0 0 200 205">${context.TemuulPixelPet.artwork({shape,color,accessory:'none'})}</svg><text x="110" y="236" fill="#ece8ff" text-anchor="middle" font-family="sans-serif" font-size="15">${name}</text></g>`).join('')}</svg>`;
sharp(Buffer.from(svg)).png().toFile(process.argv[2]||'pixel-pets-preview.png');
