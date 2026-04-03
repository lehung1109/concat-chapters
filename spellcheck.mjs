// spellcheck.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { globSync } from 'glob'
import nspell from 'nspell'
import vi from 'dictionary-vi'
import dotenv from 'dotenv'

dotenv.config()

const FOLDER = process.env.OUTPUT_FOLDER

function tokenize(text) {
  return text
    .split(/[\s,.]+/)
    .filter(w => {
      return w.length > 1 && !w.match(/^\d+$/)
    })
    .map(w => w.toLowerCase())
}

const spell = nspell(vi)
const personalDict1 = readFileSync('./custom-words.txt', 'utf-8')
const personalDict2 = readFileSync('./dictionary/words-clean.txt', 'utf-8')

spell.personal(personalDict1 + '\n' + personalDict2)

const results = new Map();

const files = globSync(`${FOLDER}/**/*.txt`)
console.log(`🔍 Tìm thấy ${files.length} file .txt\n`)

for (const filePath of files) {
  const content = readFileSync(filePath, 'utf-8')
  const words = tokenize(content)
  const errors = new Map();

  for (const word of words) {
    if (!spell.correct(word)) {
      errors.set(word, spell.suggest(word)[0])
      results.set(word, spell.suggest(word)[0])
    }
  }

  if (errors.size > 0) {
    console.log(`📄 ${filePath} — ${errors.size} lỗi`)

    for (const [word, suggestion] of errors.entries()) {
      console.log(`   ❌ "${word}" → ${suggestion}`)
    }
  }
}

writeFileSync('unknown-words.txt', Array.from(results.entries()).map(([word, suggestion]) => `${word},${suggestion}`).join('\n'), 'utf-8')
console.log(`\n📊 Tổng cộng: ${results.size} lỗi trong ${files.length} file`)
console.log('💾 Đã lưu báo cáo → unknown-words.txt')