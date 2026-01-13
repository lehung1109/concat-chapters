const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const FOLDER_PATH = path.join(__dirname, 'thinh-tien-sinh-cuu-ta', 'EPUB');
const OUTPUT_FOLDER = path.join(FOLDER_PATH, '..', 'combined-txt');
const prefixChapter = 'chap_';

if (!fs.existsSync(OUTPUT_FOLDER)) {
  fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
  console.log('✅ Đã tạo thư mục output:', OUTPUT_FOLDER);
}

function countHTMLFiles(folderPath) {
    try {
      const files = fs.readdirSync(folderPath)
        .filter(file => new RegExp(`^${prefixChapter}\\d+\\.xhtml$`).test(file)) // Chỉ lấy C1.html, C2.html...
        .sort((a, b) => {
          // Sort theo số: C10.html, C2.html -> C2.html, C10.html
          const numA = parseInt(a.match(/\d+/)?.[0] || 0);
          const numB = parseInt(b.match(/\d+/)?.[0] || 0);
          return numA - numB;
        });
      
      console.log(`📄 Tìm thấy ${files.length} file HTML: ${prefixChapter}*.xhtml`);
      console.log('📋 Danh sách (5 đầu):', files.slice(0, 5));
      
      return files.map(file => parseInt(file.match(/\d+/)?.[0] || 0));
    } catch (error) {
      console.error('❌ Lỗi đọc thư mục:', error.message);
      return [];
    }
  }

function mergeHTMLBatch(startNum, endNum) {
  let combinedText = 'Cảm ơn anh em đã luôn đồng hành và ủng hộ kênh Minh An Đạo Trưởng! Nếu mọi người có gợi ý về những bộ truyện hay, hợp với kênh, thì cứ comment bên dưới nhé. Đạo Trưởng sẽ chọn ra bộ hay nhất để đưa lên kênh. ';
  
  for (let i = startNum; i <= endNum; i++) {
    const fileName = `${prefixChapter}${i}.xhtml`;
    const filePath = path.join(FOLDER_PATH, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File ${fileName} không tồn tại`);
      continue;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);
    
    let bodyText = $('body').text().trim();

    // remove multiple new line
    bodyText = bodyText.replace(/-/g, ' ');
    bodyText = bodyText.replace(/\n\n/g, '\n');
    bodyText = bodyText.replace(/\n/g, '. ');
    bodyText = bodyText.replace(/\s+/g, ' ');
    bodyText = bodyText.replace(/\.\./g, '.');
    
    if (bodyText) {
      combinedText += bodyText + '. ';
    }
    
    console.log(`✓ Đã xử lý ${fileName}`);
  }
  
  // Tạo output file trong cùng thư mục
  const outputFile = path.join(OUTPUT_FOLDER, `output_${prefixChapter}${startNum}-${prefixChapter}${endNum}.txt`);
  fs.writeFileSync(outputFile, combinedText.trim(), 'utf-8');
  console.log(`✅ Xuất ra: ${outputFile}`);
}

function processAllBatches() {
  const totalFiles = countHTMLFiles(FOLDER_PATH);

  if (totalFiles.length === 0) {
    console.log(`❌ Không tìm thấy file ${prefixChapter}*.xhtml nào!`);
    return;
  }

  const batchSize = 20;
  
  for (let start = 1; start <= totalFiles.length; start += batchSize) {
    const end = Math.min(start + batchSize - 1, totalFiles.length);
    mergeHTMLBatch(start, end);
  }
  
  console.log('\n🎉 Hoàn thành tất cả batch!');
}

// Chạy ngay
processAllBatches();
