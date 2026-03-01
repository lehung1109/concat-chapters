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
    
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);
    
    const bodyText = $('p').map((index, element) => {
      let text = $(element).text().trim();

      text = text.replaceAll(/&/g, 'và');
      text = text.replaceAll(/["'-]/g, '');
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
      text = text.replaceAll('‘', '');
      text = text.replaceAll('’', '');
      text = text.replaceAll('(', '');
      text = text.replaceAll(')', '');
      text = text.replaceAll('——', '');
      text = text.replace(/DTVEBOOK/gi, '');
      text = text.replaceAll('~', '');
      text = text.replace(/Tàng Thư Viện/gi, 'Minh An Đao Trưởng');
      text = text.replace(/dungeons/gi, 'quái vật');
      text = text.replace(/dragons/gi, 'rồng');
      text = text.replace(/yy/gi, 'Y Y');
      text = text.replace(/binbinhh/gi, 'Bình Bình');
      text = text.replace(/Setaria/gi, 'se-ta-ri-a');
      text = text.replace(/italica/gi, 'i-ta-li-ca');
      text = text.replace(/\*1/gi, '');
      text = text.replace(/\*2/gi, '');
      text = text.replace(/\*3/gi, '');
      text = text.replace(/\*4/gi, '');
      text = text.replace(/\*/gi, '');
      text = text.replace(/8m/gi, '8 mét');
      text = text.replace(/google/gi, 'gu gồ');
      text = text.replace(/wo/gi, 'woa');
      text = text.replace(/xoauy/gi, 'xoay');
      text = text.replace(/chiii/gi, 'chi');
      text = text.replace(/aizz/gi, 'hai');
      text = text.replace(/†/gi, 't');
      text = text.replace(/q@/gi, '');
      text = text.replace(/qual/gi, 'qua');
      text = text.replace(/meow/gi, 'meo');
      text = text.replace(/vag/gi, 'vang');
      text = text.replace(/ng ười/gi, 'người');
      text = text.replace(/dcm/gi, 'Đờ cờ mờ');
      text = text.replace(/hhieenj/gi, 'hiện');
      text = text.replace(/ngaoooo/gi, 'ngao');
      text = text.replace(/tuonrg/gi, 'tưởng');
      text = text.replace(/hhai/gi, 'hai');
      text = text.replace(/iq/gi, 'ai quy');
      text = text.replace(/\./gi, '\n');
      text = text.replace(/:/gi, '\n');
      text = text.replace(/;/gi, '\n');
      text = text.replace(/!/gi, '\n');
      text = text.replace(/\?/gi, '\n');
      text = text.replace(/hazz/gi, 'hai');
      text = text.replace(/haiz/gi, 'hai');
      text = text.replace(/kih/gi, 'kinh');
      text = text.replace(/tthanh/gi, 'thanh');
      text = text.replace(/call/gi, 'côn');
      text = text.replace(/video/gi, 'vi deo');
      text = text.replace(/cap/gi, 'cao');
      text = text.replace(/nhfin/gi, 'nhìn');
      text = text.replace(/chuuts/gi, 'chút');
      text = text.replace(/tv/gi, 'ti vi');
      text = text.replace(/haha/gi, 'ha ha');
      text = text.replace(/shh/gi, 'suỵt');
      text = text.replace(/woaw/gi, 'woa');
      text = text.replace(/ah/gi, 'a');
      text = text.replace(/hahaha/gi, 'ha ha ha');
      text = text.replace(/mou/gi, 'mu');
      text = text.replace(/nguu/gi, 'ngưu');
      text = text.replace(/nag/gi, 'mang');
      text = text.replace(/dm/gi, 'đờ mờ');
      text = text.replace(/ya/gi, 'ra');
      text = text.replace(/auto/gi, 'au tu');
      text = text.replace(/max/gi, 'mác');
      text = text.replace(/level/gi, 'le vờ');
      text = text.replace(/phsut/gi, 'phút');
      text = text.replace(/thnah/gi, 'thanh');
      text = text.replace(/csos/gi, 'có');
      text = text.replace(/hack/gi, 'hách');
      text = text.replace(/game/gi, 'gêm');
      text = text.replace(/over/gi, 'âu vờ');
      text = text.replace(/sedx/gi, 'sẽ');
      text = text.replace(/bienr/gi, 'biển');
      text = text.replace(/cuung/gi, 'cung');
      text = text.replace(/tieenh/gi, 'tiên');
      text = text.replace(/cso/gi, 'có');
      text = text.replace(/fuck/gi, 'phắc');
      text = text.replace(/fuqi/gi, 'phu qui');
      text = text.replace(/feipian/gi, 'phây qui an');
      text = text.replace(/husband/gi, 'hu bừn');
      text = text.replace(/and/gi, 'và');
      text = text.replace(/wifes/gi, 'vợ');
      text = text.replace(/sliced/gi, 'sờ lai');
      text = text.replace(/lou/gi, 'lu');
      text = text.replace(/phunh/gi, 'phun');
      text = text.replace(/xun/gi, 'xum');
      text = text.replace(/sauu/gi, 'sau');
      text = text.replace(/cuuar/gi, 'của');
      text = text.replace(/bmw/gi, 'b m w');
      text = text.replace(/huyt/gi, 'hủy');
      text = text.replace(/rrat/gi, 'rất');
      text = text.replace(/cmn/gi, 'c m n');
      text = text.replace(/‎/gi, '');
      text = text.replace(/boss/gi, 'bót');
      text = text.replace(/Lục Dương/gi, 'Lục Hàn Dương');
      text = text.replace(/Vân Chi/gi, 'Vân Tố Chi');
      text = text.replace(/Cam Điềm/gi, 'Cam Lộ Điềm');
      text = text.replace(/Võ Nghiêu/gi, 'Võ Chính Nghiêu');
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
    const newResult = result.replace(pattern, (match, beforeSpace, word1, word2, afterSpace) => {
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
