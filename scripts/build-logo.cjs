// Reproducible raster exports from the code-native vector mark.
const fs=require('node:fs');
const sharp=require(process.env.TEMUUL_SHARP_PATH||'sharp');
const source=fs.readFileSync('temuul-logo.svg');
(async()=>{
  fs.copyFileSync('temuul-logo.svg','favicon.svg');
  for(const [file,size] of [['temuul-mark.png',256],['icon-192.png',192],['icon-512.png',512],['apple-touch-icon.png',180],['app-icon-192.png',192],['app-icon-512.png',512],['app-icon-1024.png',1024]]){
    await sharp(source).resize(size,size).png().toFile(file);
  }
  const inset=await sharp(source).resize(384,384).png().toBuffer();
  await sharp({create:{width:512,height:512,channels:4,background:'#7560dc'}}).composite([{input:inset,left:64,top:64}]).png().toFile('icon-maskable-512.png');
})();
