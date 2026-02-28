const path = require('path');
const fs = require('fs');

const filePath = 'F:/projects/concat-chapters/ta-o-nhan-gian-lap-dia-thanh-tien/combined-txt/output_C1-C1.txt';
const outputFolder = 'F:/projects/concat-chapters/ta-o-nhan-gian-lap-dia-thanh-tien/text-short-video';

const text = fs.readFileSync(filePath, 'utf-8');
const rows = text.split('\n');

// create outputFolder if not exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// get 50 rows of text save save to outputFolder
for (let i = 0; i < rows.length; i += 50) {
  const textShort = rows.slice(i, i + 50).join('\n');

  fs.writeFileSync(path.join(outputFolder, `text_${i}.txt`), textShort, 'utf-8');

  console.log(`Saved text_${i}.txt`);
}
