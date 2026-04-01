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
const REPLACE_CSV_PATH = process.env.REPLACE_CSV_PATH || ''; // đường dẫn file CSV (tùy chọn)

/**
 * Escape ký tự đặc biệt regex để dùng làm literal trong RegExp.
 */
function escapeRe(str) {
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Đọc danh sách thay thế từ file CSV.
 * Định dạng: mỗi dòng "từ_cần_tìm,thay_bằng" (cột 1 = tìm, cột 2 = thay).
 * Nếu cột 2 rỗng = xóa chuỗi tìm. Không trim — giữ space đầu/cuối để khớp có hoặc không có khoảng trắng.
 * Trả về [] nếu file không tồn tại hoặc rỗng.
 */
function loadReplacementsFromCSV(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter((l) => l.length > 0);
  const pairs = [];
  for (const line of lines) {
    const firstComma = line.indexOf(',');
    if (firstComma === -1) continue;
    const from = line.slice(0, firstComma);
    const to = line.slice(firstComma + 1);
    // Cho phép "to" chứa dấu phẩy (phần sau dấu phẩy đầu tiên là to)
    pairs.push([from, to]);
  }
  return pairs;
}

/**
 * Tạo hàm thay thế nhanh: gom nhiều "from" vào regex theo cụm,
 * tránh loop từng rule + tạo RegExp lặp lại cho mỗi đoạn text.
 */
function buildReplacementApplier(pairs, { chunkSize = 250 } = {}) {
  if (!pairs || pairs.length === 0) return null;

  const cleaned = pairs
    .map(([from, to]) => [String(from ?? ''), String(to ?? '')])
    .filter(([from]) => from.length > 0);

  if (cleaned.length === 0) return null;

  // Ưu tiên match chuỗi dài hơn nếu có overlap (vd: "abc" và "ab")
  cleaned.sort((a, b) => b[0].length - a[0].length);

  const chunks = [];
  for (let i = 0; i < cleaned.length; i += chunkSize) {
    const slice = cleaned.slice(i, i + chunkSize);
    const map = new Map(slice.map(([from, to]) => [from.toLowerCase(), to]));
    const pattern = slice.map(([from]) => escapeRe(from)).join('|');
    const re = new RegExp(pattern, 'gi');
    chunks.push({ re, map });
  }

  return (text) => {
    let out = text;
    for (const { re, map } of chunks) {
      out = out.replaceAll(re, (m) => {
        const repl = map.get(m.toLowerCase());
        return repl === undefined ? m : repl;
      });
    }
    return out;
  };
}

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
  const replacementPairs = loadReplacementsFromCSV(REPLACE_CSV_PATH);
  if (replacementPairs.length > 0) {
    console.log(`📝 Áp dụng ${replacementPairs.length} quy tắc thay thế từ CSV: ${REPLACE_CSV_PATH}`);
  }
  const applyReplacements = buildReplacementApplier(replacementPairs);

  let combinedText = '';
  
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
      let text = $(element).text().trim();

      // Áp dụng thay thế từ file CSV (tìm = cột 1, thay = cột 2, không phân biệt hoa thường)
      // Nhanh hơn đáng kể nhờ precompile regex theo cụm.
      if (applyReplacements) {
        text = applyReplacements(text);
      }

      text = text.replaceAll(/&/g, 'và');
      text = text.replaceAll(/@/g, 'a còng');
      text = text.replaceAll(/\+/g, ' + ');
      text = text.replaceAll(/["']/g, '');
      text = text.replaceAll(/»/g, '');
      text = text.replaceAll(/«/g, '');
      text = text.replaceAll('《', '');
      text = text.replaceAll('【', '');
      text = text.replaceAll('】', '');
      text = text.replaceAll('》', '');
      text = text.replaceAll('–', '');
      text = text.replaceAll('…', '');
      text = text.replaceAll('”,', '”');
      text = text.replaceAll(/\.+/g, '.');
      text = text.replaceAll(/ \./g, ' ');
      text = text.replaceAll(/\s+/g, ' ');
      text = text.replaceAll('“', '');
      text = text.replaceAll('”', '');
      text = text.replaceAll('‘', '');
      text = text.replaceAll('’', '');
      text = text.replaceAll('(', ', ');
      text = text.replaceAll(')', '');
      text = text.replaceAll('——', '');
      text = text.replaceAll('[', '');
      text = text.replaceAll(']', '');
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
      text = text.replaceAll(/·/gi, '');

      text = text.split('\n').map(text => {
        let newText = text.trim();

        // neu newText lớn hơn 130 ký tự, thì tìm kiếm dấu , từ ký tự 130 trở đi thay bằng \n
        if(newText.length > maxCharacterPerFile) {
          const index = newText.indexOf(',', maxCharacterPerFile);

          if(index !== -1) {
            newText = newText.slice(0, index).trim() + '\n' + newText.slice(index + 1).trim();
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

function xuLyVanBan(text, maxLen = 1) {
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
    const newResult = result.replaceAll(pattern, (match, p1, p2) => {
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
  // Ví dụ: " càng ngày càng " → " càng ngày, càng "
  // Đảm bảo từ hoàn chỉnh: phía trước và phía sau đều có khoảng trắng hoặc đầu/cuối chuỗi
  
  // Regex pattern:
  // (^|\s) - đầu chuỗi hoặc khoảng trắng trước từ đầu tiên
  // (\S+) - từ đầu tiên (word1)
  // \s+ - khoảng trắng giữa
  // (\S+) - từ ở giữa (word2)
  // (?![,\.]) - không có dấu phẩy hoặc dấu chấm ngay sau từ giữa
  // \s+ - khoảng trắng giữa
  // \2 - từ đầu tiên lặp lại (backreference)
  // (\s|$) - khoảng trắng hoặc cuối chuỗi sau từ cuối cùng
  const pattern = /(^|\s)(\S+)\s+(\S+)(?![,\.])\s+\2(\s|$)/g;
  
  let result = text;
  let hasChanged = true;
  let maxIterations = 100; // Giới hạn số lần lặp để tránh vòng lặp vô hạn
  let iterations = 0;
  
  // Lặp lại cho đến khi không còn thay đổi nào
  while (hasChanged && iterations < maxIterations) {
    hasChanged = false;
    const newResult = result.replaceAll(pattern, (match, beforeSpace, word1, word2, afterSpace) => {
      // Kiểm tra xem đã có dấu phẩy chưa để tránh xử lý lại
      if (!match.includes(',')) {
        hasChanged = true;
        // Giữ lại khoảng trắng hoặc đầu/cuối chuỗi, thêm dấu phẩy sau từ giữa
        return `${beforeSpace}${word1} ${word2}, ${word1}${afterSpace}`;
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
