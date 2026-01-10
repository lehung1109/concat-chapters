const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const FOLDER_PATH = path.join(__dirname, 'vu-than-thien-ha-vu-phong', 'OEBPS', 'Text');
const OUTPUT_FOLDER = path.join(FOLDER_PATH, 'combined-txt');

if (!fs.existsSync(OUTPUT_FOLDER)) {
  fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
  console.log('✅ Đã tạo thư mục output:', OUTPUT_FOLDER);
}

function countHTMLFiles(folderPath) {
    try {
      const files = fs.readdirSync(folderPath)
        .filter(file => /^C\d+\.xhtml$/.test(file)) // Chỉ lấy C1.html, C2.html...
        .sort((a, b) => {
          // Sort theo số: C10.html, C2.html -> C2.html, C10.html
          const numA = parseInt(a.match(/\d+/)?.[0] || 0);
          const numB = parseInt(b.match(/\d+/)?.[0] || 0);
          return numA - numB;
        });
      
      console.log(`📄 Tìm thấy ${files.length} file HTML: C*.html`);
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
    const fileName = `C${i}.xhtml`;
    const filePath = path.join(FOLDER_PATH, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File ${fileName} không tồn tại`);
      continue;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);
    
    $('h1').remove();
    const bodyText = $('body').text().trim();
    
    if (bodyText) {
      combinedText += bodyText + '\n';
    }
    
    console.log(`✓ Đã xử lý ${fileName}`);
  }
  
  // Tạo output file trong cùng thư mục
  const outputFile = path.join(OUTPUT_FOLDER, `output_C${startNum}-C${endNum}.txt`);
  fs.writeFileSync(outputFile, combinedText.trim(), 'utf-8');
  console.log(`✅ Xuất ra: ${outputFile}`);
}

function processAllBatches() {
  const totalFiles = countHTMLFiles(FOLDER_PATH);

  if (totalFiles.length === 0) {
    console.log('❌ Không tìm thấy file C*.html nào!');
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
