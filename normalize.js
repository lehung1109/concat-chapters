const path = require('path');
const fs = require('fs');
const dictionary = require('@vntk/dictionary');

require('dotenv').config()

const FOLDER_PATH = process.env.FOLDER_PATH;
const OUTPUT_FOLDER = process.env.OUTPUT_FOLDER;

// read words in dictionary/words.txt, 1 line in txt like this: {"text": "Bản mẫu:-vie-", "source": "wiktionary"}
// so we need to parse to get text only in each line, dont use JSON.parse because it will throw error
const dictionaryWords = fs.readFileSync('dictionary/words.txt', 'utf-8').split('\n').map(line => {
  const text = line.split(',')[0].split(':')[1].trim().replaceAll('"', '');

  return text;
});

function findEnglishWords(sentence) {
  const words = sentence.split(/\s+|,|\./).map(word => {
    const cleaned = word.replaceAll(/[.,!?"']/g, '');

    return cleaned.toLowerCase();
  });

  return words.filter(word => {
    // ignore if word is string number
    if(/^\d+$/.test(word)) {
      return false;
    }

    return word.length > 0;
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

  if(file.includes('page-104')) {
    console.log('test');
  }

  // remove duplicate english word
  const uniqueEnglishWords = [...new Set(englishWords)];

  // check if word is not in ignore-english.txt then add to ignore-english.txt
  const ignoreEnglishWords = fs.readFileSync('ignore-english.txt', 'utf-8').split('\n');
  const newIgnoreEnglishWords = uniqueEnglishWords.filter(word => !ignoreEnglishWords.includes(word) && !dictionary.has(word) && !dictionaryWords.includes(word));

  // write word to ignore-english.txt but not overwrite the file
  if (newIgnoreEnglishWords.length > 0) {
    fs.appendFileSync('ignore-english.txt', '\n' + newIgnoreEnglishWords.join('\n'));

    console.log(`✅ ${newIgnoreEnglishWords.length} từ đã được thêm vào ignore-english.txt`);
  }
}
