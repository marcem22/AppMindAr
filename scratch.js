import fs from 'fs';
import path from 'path';

const dataJsPath = './src/data.js';
const dataJsContent = fs.readFileSync(dataJsPath, 'utf8');

const regex = /"arMarker":\s*"([^"]+)"/g;
const validMarkers = new Set();
let match;
while ((match = regex.exec(dataJsContent)) !== null) {
  validMarkers.add(match[1]);
}

// Some markers might be missing from the files but we only delete files that are NOT in validMarkers
const dirs = ['./models', './public/models', './docs/models'];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.glb') && !file.endsWith('.usdz')) continue;
    
    const basename = path.parse(file).name;
    if (!validMarkers.has(basename)) {
      console.log(`Deleting ${dir}/${file}`);
      fs.unlinkSync(`${dir}/${file}`);
    }
  }
}
console.log("Valid markers:", Array.from(validMarkers).join(', '));
