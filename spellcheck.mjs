// spellcheck.mjs
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { globSync } from "glob";
import nspell from "nspell";
import vi from "dictionary-vi";
import dotenv from "dotenv";

dotenv.config();

const FOLDER = process.env.OUTPUT_FOLDER;
const REPLACE_SPELL_PATH = process.env.REPLACE_SPELL_PATH || '';

function getReplacementPairs() {
  const content = readFileSync(REPLACE_SPELL_PATH, "utf-8");
  const mapWords = new Map();

  content.split(/\r?\n/).forEach(line => {
    const [oldWord, newWord] = line.split(',');

    if(oldWord) {
      mapWords.set(oldWord.trim().toLowerCase(), newWord.trim() || '');
    }
  });

  return mapWords;
}

const replacementPairs = getReplacementPairs();

const spell = nspell(vi);
const personalDict1 = readFileSync("./custom-words.txt", "utf-8");
const personalDict2 = readFileSync("./dictionary/words-clean.txt", "utf-8");

writeFileSync("unknown-words.txt", "", "utf-8");

spell.personal(personalDict1 + "\n" + personalDict2);

const results = new Set();

const files = globSync(`${FOLDER}/**/*.txt`);
console.log(`🔍 Tìm thấy ${files.length} file .txt\n`);

for (const filePath of files) {
  const content = readFileSync(filePath, "utf-8");
  const errors = new Set();
  let newContent = "";

  content.split(/[\n,.]/).forEach((line) => {
    let newLine = '';

    line.split(/\s/).forEach((word) => {
      const trimWord = word.trim();
      let newWord = trimWord.toLowerCase();

      if (trimWord.length <= 1 || trimWord.match(/^\d+$/)) {
        return;
      }

      if (!spell.correct(trimWord)) {
        newWord = replacementPairs.get(trimWord) || '';
        errors.add(trimWord);
        results.add(trimWord);
        appendFileSync("unknown-words.txt", `${word}\n`, "utf-8");
      }

      newLine += newWord + ' ';
    });

    if(newLine.trim().length > 0) {
      newContent += newLine + "\n";
    }
  });

  if (errors.size > 0) {
    console.log(`📄 ${filePath} — ${errors.size} lỗi`);

    for (const word of errors) {
      console.log(`   ❌ "${word}"`);
    }
  }

  writeFileSync(filePath, newContent, "utf-8");
}

console.log(`\n📊 Tổng cộng: ${results.size} lỗi trong ${files.length} file`);
console.log("💾 Đã lưu báo cáo → unknown-words.txt");
