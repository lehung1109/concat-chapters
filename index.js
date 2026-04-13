const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

require('dotenv').config()

const FOLDER_PATH = process.env.FOLDER_PATH;
const OUTPUT_FOLDER = process.env.OUTPUT_FOLDER;
const prefixChapter = process.env.PREFIX_CHAPTER;
const extension = process.env.EXTENSION;
const batchSize = Number.parseInt(process.env.BATCH_SIZE);
const startChapter = Number.parseInt(process.env.START_CHAPTER);
const maxCharacterPerFile = Number.parseInt(process.env.MAX_CHARACTER_PER_FILE);

if (!fs.existsSync(OUTPUT_FOLDER)) {
  fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
  console.log('✅ Đã tạo thư mục output:', OUTPUT_FOLDER);
}


const REPLACE_CSV_PATH = process.env.REPLACE_CSV_PATH || '';

function getReplacementPairs() {
  const content = fs.readFileSync(REPLACE_CSV_PATH, 'utf-8');
  const mapWords = new Map();

  content.split('\n').forEach(line => {
    const [oldWord, newWord] = line.split(',');

    if(oldWord) {
      mapWords.set(oldWord.trim().toLowerCase(), newWord.trim() || '');
    }
  });
  
  return mapWords;
}

const replacementPairs = getReplacementPairs();

function replaceText(text) {
  let newText = text;

  replacementPairs.forEach((newWord, oldWord) => {
    newText = newText.replaceAll(new RegExp(oldWord, 'gi'), newWord);
  });

  return newText;
}

function countHTMLFiles(folderPath) {
    try {
      const files = fs.readdirSync(folderPath)
      // include page-0.html, page-1.html, page-2.html, ...
        .filter(file => new RegExp(`^${prefixChapter}\\d+\\.${extension}$`).test(file))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || 0);
          const numB = parseInt(b.match(/\d+/)?.[0] || 0);
          return numA - numB;
        });
      
      console.log(`📄 Tìm thấy ${files.length} file HTML: ${prefixChapter}*.${extension}`);
      console.log('📋 Danh sách (5 đầu):', files.slice(0, 5));
      
      return files.map(file => parseInt(file.match(/\d+/)?.[0] || 0));
    } catch (error) {
      console.error('❌ Lỗi đọc thư mục:', error.message);
      return [];
    }
  }

function mergeHTMLBatch(startNum, endNum) {
  let combinedText = '';
  
  for (let i = startNum; i <= endNum; i++) {
    const fileName = `${prefixChapter}${i}.${extension}`;
    const filePath = path.join(FOLDER_PATH, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File ${fileName} không tồn tại`);
      continue;
    }
    
    let html = fs.readFileSync(filePath, 'utf-8');
    html = html.replaceAll(/<p>[^<]*&#160;[^<]*<\/p>/g, '');
    const $ = cheerio.load(html);
    
    const bodyText = $('p:not(.firstpara)').map((index, element) => {
      let text = $(element).text().trim();

      text = replaceText(text);

      text = text.replaceAll(/&/g, ' và ');
      text = text.replaceAll(/@/g, ' a còng ');
      text = text.replaceAll(/-/g, ' ');
      text = text.replaceAll(/%/g, ' phần trăm ');
      text = text.replaceAll(/\//g, ' trên ');
      text = text.replaceAll(/℃/g, ' độ c ');
      text = text.replaceAll(/\$/g, ' đô la ');
      text = text.replaceAll(/#/g, ' khác ');
      text = text.replaceAll(/\+/g, ' + ');
      text = text.replaceAll(/["']/g, ' ');
      text = text.replaceAll(/»/g, ' ');
      text = text.replaceAll(/«/g, ' ');
      text = text.replaceAll('《', ' ');
      text = text.replaceAll('【', ' ');
      text = text.replaceAll('】', ' ');
      text = text.replaceAll('》', ' ');
      text = text.replaceAll('–', ' ');
      text = text.replaceAll('…', ' ');
      text = text.replaceAll('”,', ' ” ');
      text = text.replaceAll(/\.+/g, '.');
      text = text.replaceAll(/ \./g, ' ');
      text = text.replaceAll(/\s+/g, ' ');
      text = text.replaceAll('“', ' ');
      text = text.replaceAll('”', ' ');
      text = text.replaceAll('‘', ' ');
      text = text.replaceAll('’', ' ');
      text = text.replaceAll('(', ', ');
      text = text.replaceAll(')', ' ');
      text = text.replaceAll('——', ' ');
      text = text.replaceAll('—', ' ');
      text = text.replaceAll('[', ' ');
      text = text.replaceAll(']', ' ');
      text = text.replaceAll(/DTVEBOOK/gi, '');
      text = text.replaceAll('~', '');
      text = text.replaceAll(/Tàng Thư Viện/gi, 'Minh An Đao Trưởng');
      text = text.replaceAll(/\*1/gi, '');
      text = text.replaceAll(/\*2/gi, '');
      text = text.replaceAll(/\*3/gi, '');
      text = text.replaceAll(/\*4/gi, '');
      text = text.replaceAll(/\*/gi, '');
      text = text.replaceAll(/\./gi, '\n');
      text = text.replaceAll(/:/gi, '\n');
      text = text.replaceAll(/;/gi, '\n');
      text = text.replaceAll(/!/gi, '\n');
      text = text.replaceAll(/\?/gi, '\n');
      text = text.replaceAll(/cm/gi, ' c m');
      text = text.replaceAll(/`/gi, ' ');
      text = text.replaceAll(/·/gi, ' ');
      text = text.replaceAll(/m²/gi, ' mét vuông ');
      text = text.replaceAll(/°c/gi, ' độ sê ');
      text = text.replaceAll(/kg/gi, ' ki lô gam ');

      text = text.split('\n').map(text => {
        let newText = text.trim();

        // neu newText lớn hơn 130 ký tự, thì tìm kiếm dấu , từ ký tự 130 trở đi thay bằng \n
        if(newText.length > maxCharacterPerFile) {
          const index = newText.indexOf(',', maxCharacterPerFile);

          if(index !== -1) {
            newText = newText.slice(0, index).trim() + '\n' + newText.slice(index + 1).trim().split(',').map(text => text.trim()).join('\n');
          }
        }

        return newText;
      }).join('\n');

      if(text.endsWith('.') || text.endsWith(',')) {
        text = text.slice(0, -1);
      }

      return text.trim();
    }).get().filter(text => text.length > 0).join('\n');
    
    if (bodyText && combinedText) {
      combinedText = combinedText + '\n' + bodyText;
    } else if (bodyText) {
      combinedText = bodyText;
    }
    
    console.log(`✓ Đã xử lý ${fileName}`);
  }
  
  // Tạo output file trong cùng thư mục
  const outputFile = path.join(OUTPUT_FOLDER, `output_${prefixChapter}${startNum}-${prefixChapter}${endNum}.txt`);
  fs.writeFileSync(outputFile, combinedText, 'utf-8');
  console.log(`✅ Xuất ra: ${outputFile}`);
}

function processAllBatches() {
  const totalFiles = countHTMLFiles(FOLDER_PATH);

  if (totalFiles.length === 0) {
    console.log(`❌ Không tìm thấy file ${prefixChapter}*.${extension} nào!`);
    return;
  }

  // Số chương lớn nhất = số lấy từ tên chương cuối cùng trong danh sách
  const maxChapterNum = Math.max(...totalFiles);

  for (let start = startChapter; start <= maxChapterNum; start += batchSize) {
    const end = Math.min(start + batchSize - 1, maxChapterNum);
    mergeHTMLBatch(start, end);
  }
  
  console.log('\n🎉 Hoàn thành tất cả batch!');
}

// Chạy ngay
processAllBatches();
