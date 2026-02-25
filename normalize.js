const path = require('path');
const fs = require('fs');
const dictionary = require('@vntk/dictionary');

const FOLDER_PATH = path.join(__dirname, 'nhan-dao-dai-thanh-mac-mac', 'OEBPS', 'Text');
const OUTPUT_FOLDER = path.join(FOLDER_PATH, '..', '..', 'combined-txt');

function findEnglishWords(sentence) {
  const words = sentence.split(/\s+/).map(word => {
    const cleaned = word.replaceAll(/[.,!?"']/g, '');

    return cleaned.toLowerCase();
  });

  return words.filter(word => {
    const cleaned = word.replaceAll(/[^a-zA-ZÀ-ỹ]/g, ''); // xóa cả các ký tự kết thúc câu như ., !, ?

    return /^[a-zA-Z]+$/.test(cleaned) && cleaned.length > 0;
  });
}

// read all files txt in OUTPUT_FOLDER
const files = fs.readdirSync(OUTPUT_FOLDER);

// empty ignore-english.txt
fs.writeFileSync('ignore-english.txt', '');

// use for of to read all files
for (const file of files) {
  const filePath = path.join(OUTPUT_FOLDER, file);
  const text = fs.readFileSync(filePath, 'utf-8');
  const englishWords = findEnglishWords(text);

  // remove duplicate english word
  const uniqueEnglishWords = [...new Set(englishWords)];

  // check if word is not in ignore-english.txt then add to ignore-english.txt
  const ignoreEnglishWords = fs.readFileSync('ignore-english.txt', 'utf-8').split('\n');
  const newIgnoreEnglishWords = uniqueEnglishWords.filter(word => !ignoreEnglishWords.includes(word) && !dictionary.has(word));

  // write word to ignore-english.txt but not overwrite the file
  if (newIgnoreEnglishWords.length > 0) {
    fs.appendFileSync('ignore-english.txt', '\n' + newIgnoreEnglishWords.join('\n'));

    console.log(`✅ ${newIgnoreEnglishWords.length} từ đã được thêm vào ignore-english.txt`);
  }
}
