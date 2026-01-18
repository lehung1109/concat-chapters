const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const FOLDER_PATH = path.join(__dirname, 'sieu-nang-luc-ta-co-mot-chiec-guong-sao-chep', 'OEBPS');
const OUTPUT_FOLDER = path.join(FOLDER_PATH, '..', 'combined-txt');
const prefixChapter = 'page-';
const extension = 'html';
const batchSize = 20;

if (!fs.existsSync(OUTPUT_FOLDER)) {
  fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
  console.log('✅ Đã tạo thư mục output:', OUTPUT_FOLDER);
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
  let combinedText = 'Cảm ơn anh em đã luôn đồng hành và ủng hộ kênh Minh An Đạo Trưởng! Nếu mọi người có gợi ý về những bộ truyện hay, hợp với kênh thì cứ comment bên dưới nhé. Đạo Trưởng sẽ chọn ra bộ hay nhất để đưa lên kênh. ';
  
  for (let i = startNum; i <= endNum; i++) {
    const fileName = `${prefixChapter}${i}.${extension}`;
    const filePath = path.join(FOLDER_PATH, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File ${fileName} không tồn tại`);
      continue;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);
    
    const bodyText = $('p').map((index, element) => {
      const text = $(element).text().replaceAll(/["'!?-]/g, '').replaceAll('《', '').replaceAll('》', '').replaceAll(/\.+/g, '.').replaceAll(/ \./g, ' ').replaceAll(/\s+/g, ' ');

      return text === '.' ? '' : text;
    }).get().reduce((acc, line) => {
      if (line) {
        return `${acc}${line === '.' ? ' ' : line}${line.endsWith('.') || line.endsWith(',') ? ' ' : '. '}`;
      }

      return acc + ' ';
    }, '');
    
    if (bodyText) {
      combinedText += xuLyVanBan(bodyText.replaceAll(/ \./g, ' ').replaceAll(/\s+/g, ' ').replaceAll("đi theo", "đi thẹo"));
    }
    
    console.log(`✓ Đã xử lý ${fileName}`);
  }
  
  // Tạo output file trong cùng thư mục
  const outputFile = path.join(OUTPUT_FOLDER, `output_${prefixChapter}${startNum}-${prefixChapter}${endNum}.txt`);
  fs.writeFileSync(outputFile, combinedText.trim(), 'utf-8');
  console.log(`✅ Xuất ra: ${outputFile}`);
}

function xuLyVanBan(text, maxLen = 20) {
  // Regex match nội dung + delimiter (bao gồm space sau)
  const pattern = /([^.,:]+?)([.,:]\s*)/g;
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const content = match[1].trim();
    if (content.length < maxLen) {
      // Câu ngắn: thay bằng content sạch (xóa dấu ngắt)
      result += content + ' ';
    } else {
      // Câu dài: giữ nguyên toàn bộ match (content + dấu ngắt)
      result += match[0];
    }
    lastIndex = pattern.lastIndex;
  }

  // Phần cuối không match
  if (lastIndex < text.length) {
    const lastPart = text.slice(lastIndex).trim();
    if (lastPart.length < maxLen) {
      result += lastPart;
    } else {
      result += text.slice(lastIndex);
    }
  }

  return result.trim();
}

function processAllBatches() {
  const totalFiles = countHTMLFiles(FOLDER_PATH);

  if (totalFiles.length === 0) {
    console.log(`❌ Không tìm thấy file ${prefixChapter}*.${extension} nào!`);
    return;
  }

  for (let start = 0; start <= totalFiles.length; start += batchSize) {
    const end = Math.min(start + batchSize - 1, totalFiles.length);
    mergeHTMLBatch(start, end);
  }
  
  console.log('\n🎉 Hoàn thành tất cả batch!');
}

// Chạy ngay
processAllBatches();
