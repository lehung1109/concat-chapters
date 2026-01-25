const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const FOLDER_PATH = path.join(__dirname, 'than-de-vu-phong', 'OEBPS', "Text");
const OUTPUT_FOLDER = path.join(FOLDER_PATH, '..', 'combined-txt');
const prefixChapter = 'C';
const extension = 'xhtml';
const batchSize = 20;
const startChapter = 1;

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
  let combinedText = 'Cảm ơn anh em đã luôn đồng hành và ủng hộ kênh Minh An Đạo Trưởng, Nếu mọi người có gợi ý về những bộ truyện hay, hợp với kênh thì cứ bình luận bên dưới nhé. Đạo Trưởng sẽ chọn ra bộ hay nhất để đưa lên kênh. ';
  
  for (let i = startNum; i <= endNum; i++) {
    const fileName = `${prefixChapter}${i}.${extension}`;
    const filePath = path.join(FOLDER_PATH, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File ${fileName} không tồn tại`);
      continue;
    }
    
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);
    
    const bodyText = $('p, h1').map((index, element) => {
      let text = $(element).text();

      text = text.replaceAll(/["'!?-]/g, '');
      text = text.replaceAll('《', '');
      text = text.replaceAll('【', '');
      text = text.replaceAll('】', '');
      text = text.replaceAll('》', '');
      text = text.replaceAll('–', '');
      text = text.replaceAll('…', '');
      text = text.replaceAll(/\.+/g, '.');
      text = text.replaceAll(/ \./g, ' ');
      text = text.replaceAll(/\s+/g, ' ');
      text = text.replaceAll('“', '');
      text = text.replaceAll('”', '');
      text = text.replaceAll(':', '');
      text = text.replaceAll('‘', '');
      text = text.replaceAll('’', '');
      text = text.replaceAll('(', '');
      text = text.replaceAll(')', '');

      return text === '.' ? '' : text;
    }).get().reduce((acc, line) => {
      if (line) {
        return `${acc}${line === '.' ? ' ' : line}${line.endsWith('.') || line.endsWith(',') ? ' ' : '. '}`;
      }

      return acc + ' ';
    }, '');
    
    if (bodyText) {
      combinedText = combinedText + ' ' + xuLyVanBan(bodyText.replaceAll(/ \./g, ' ').replaceAll(/\s+/g, ' '));
    }
    
    console.log(`✓ Đã xử lý ${fileName}`);
  }

  combinedText = combinedText.replaceAll(/\s+/g, ' ').trim();
  
  // Thêm dấu phẩy giữa 2 từ trùng nhau cách nhau bởi 1 từ
  combinedText = themDauPhayGiuaTuTrungLap(combinedText);
  
  // Xóa cặp từ trùng lặp trước khi xuất file
  combinedText = xoaCapTuTrungLap(combinedText);
  
  // Tạo output file trong cùng thư mục
  const outputFile = path.join(OUTPUT_FOLDER, `output_${prefixChapter}${startNum}-${prefixChapter}${endNum}.txt`);
  fs.writeFileSync(outputFile, combinedText, 'utf-8');
  console.log(`✅ Xuất ra: ${outputFile}`);
}

function xuLyVanBan(text, maxLen = 2) {
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

function xoaCapTuTrungLap(text) {
  // Tìm và xóa cặp từ trùng lặp ngăn cách bởi dấu . hoặc , hoặc khoảng trắng
  // Pattern: (word1 word2) [delimiter] (word1 word2)
  // Delimiter có thể là: . hoặc , hoặc khoảng trắng
  
  // Regex để tìm cặp từ (ít nhất 2 từ) lặp lại sau delimiter
  // \b để đảm bảo match từ đầy đủ, không phải phần của từ khác
  const pattern = /\b(\S+\s+\S+)([.,]\s*|\s+)\1\b/g;
  
  let result = text;
  let hasChanged = true;
  let maxIterations = 100; // Giới hạn số lần lặp để tránh vòng lặp vô hạn
  let iterations = 0;
  
  // Lặp lại cho đến khi không còn thay đổi nào
  while (hasChanged && iterations < maxIterations) {
    hasChanged = false;
    const newResult = result.replace(pattern, (match, p1, p2) => {
      hasChanged = true;
      return p1; // Chỉ giữ lại cặp từ đầu tiên
    });
    
    if (hasChanged) {
      result = newResult;
      iterations++;
    }
  }
  
  if (iterations >= maxIterations) {
    console.warn(`⚠️ Cảnh báo: xoaCapTuTrungLap đạt giới hạn ${maxIterations} lần lặp. Có thể còn pattern chưa xử lý hết.`);
  }
  
  return result;
}

function themDauPhayGiuaTuTrungLap(text) {
  // Tìm và thêm dấu phẩy vào cuối từ ở giữa 2 từ trùng nhau
  // Pattern: (word1) (word2) (word1)
  // Ví dụ: "càng ngày càng" → "càng ngày, càng"
  
  // Regex để tìm pattern: từ1 từ2 từ1 (chỉ match nếu chưa có dấu phẩy sau từ2)
  // \b để đảm bảo match từ đầy đủ, không phải phần của từ khác
  // Tránh match nếu đã có dấu phẩy hoặc dấu chấm sau từ ở giữa
  const pattern = /\b(\S+)\s+(\S+)(?![,\.])\s+\1\b/g;
  
  let result = text;
  let hasChanged = true;
  let maxIterations = 100; // Giới hạn số lần lặp để tránh vòng lặp vô hạn
  let iterations = 0;
  
  // Lặp lại cho đến khi không còn thay đổi nào
  while (hasChanged && iterations < maxIterations) {
    hasChanged = false;
    const newResult = result.replace(pattern, (match, p1, p2) => {
      // Kiểm tra xem đã có dấu phẩy chưa để tránh xử lý lại
      if (!match.includes(',')) {
        hasChanged = true;
        return `${p1} ${p2}, ${p1}`;
      }
      return match;
    });
    
    if (hasChanged) {
      result = newResult;
      iterations++;
    }
  }
  
  if (iterations >= maxIterations) {
    console.warn(`⚠️ Cảnh báo: themDauPhayGiuaTuTrungLap đạt giới hạn ${maxIterations} lần lặp. Có thể còn pattern chưa xử lý hết.`);
  }
  
  return result;
}

function processAllBatches() {
  const totalFiles = countHTMLFiles(FOLDER_PATH);

  if (totalFiles.length === 0) {
    console.log(`❌ Không tìm thấy file ${prefixChapter}*.${extension} nào!`);
    return;
  }

  for (let start = startChapter; start <= totalFiles.length; start += batchSize) {
    const end = Math.min(start + batchSize - 1, totalFiles.length);
    mergeHTMLBatch(start, end);
  }
  
  console.log('\n🎉 Hoàn thành tất cả batch!');
}

// Chạy ngay
processAllBatches();
