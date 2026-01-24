const fs = require('fs');
const path = require('path');

const OUTPUT_FOLDER = path.join(__dirname, 'than-de-vu-phong', 'OEBPS', 'combined-txt');
const ERROR_FILE = path.join(__dirname, 'error-duplicate.txt');

/**
 * Kiểm tra từ trùng trong mỗi câu
 * @param {string} text - Văn bản cần kiểm tra
 * @returns {Array} - Mảng các câu có từ trùng
 */
function checkDuplicateWords(text) {
  // Tách câu dựa trên dấu . hoặc ,
  // Giữ lại dấu ngắt câu trong kết quả
  const sentences = text.split(/([.,])/).reduce((acc, part, index, array) => {
    if (part === '.' || part === ',') {
      // Nếu là dấu ngắt, gộp với phần trước
      if (acc.length > 0) {
        acc[acc.length - 1] += part;
      }
    } else if (part.trim()) {
      // Nếu là nội dung, thêm vào mảng
      acc.push(part.trim());
    }
    return acc;
  }, []).filter(s => s.length > 0);

  const results = [];

  sentences.forEach((sentence, index) => {
    // Loại bỏ dấu câu ở cuối để tách từ
    const cleanSentence = sentence.replace(/[.,]$/, '');
    
    // Tách thành các từ (loại bỏ khoảng trắng thừa)
    const words = cleanSentence
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.toLowerCase()); // Chuyển về chữ thường để so sánh

    // Lưu vị trí của mỗi từ
    const wordPositions = {};
    words.forEach((word, pos) => {
      if (!wordPositions[word]) {
        wordPositions[word] = [];
      }
      wordPositions[word].push(pos);
    });

    // Kiểm tra từ trùng với khoảng cách = 1 (không báo lỗi nếu liền nhau)
    const duplicates = [];
    
    Object.keys(wordPositions).forEach(word => {
      const positions = wordPositions[word];
      
      // Nếu từ xuất hiện ít nhất 2 lần
      if (positions.length >= 2) {
        // Kiểm tra xem có cặp nào cách nhau đúng 1 từ không (không báo lỗi nếu liền nhau)
        let hasCloseDuplicate = false;
        for (let i = 0; i < positions.length - 1; i++) {
          const distance = positions[i + 1] - positions[i] - 1;
          if (distance === 1) {
            hasCloseDuplicate = true;
            break;
          }
        }
        
        if (hasCloseDuplicate) {
          duplicates.push({
            word: word,
            count: positions.length,
            positions: positions
          });
        }
      }
    });

    // Nếu có từ trùng gần nhau, thêm vào kết quả
    if (duplicates.length > 0) {
      results.push({
        sentenceIndex: index + 1,
        sentence: sentence.trim(),
        duplicateWords: duplicates
      });
    }
  });

  return results;
}

/**
 * Ghi lỗi vào file error-duplicate.txt
 * @param {string} fileName - Tên file có lỗi
 * @param {Array} duplicates - Mảng các câu có từ trùng
 */
function writeErrorToFile(fileName, duplicates) {
  let errorContent = `❌ LỖI: Tìm thấy ${duplicates.length} câu có từ trùng trong file "${fileName}"\n`;
  errorContent += '='.repeat(60) + '\n\n';

  duplicates.forEach(result => {
    errorContent += `Câu ${result.sentenceIndex}:\n`;
    errorContent += `"${result.sentence}"\n`;
    errorContent += `Từ trùng:\n`;
    result.duplicateWords.forEach(({ word, count }) => {
      errorContent += `  - "${word}" (xuất hiện ${count} lần)\n`;
    });
    errorContent += '\n';
  });

  errorContent += '='.repeat(60) + '\n';
  errorContent += `Thời gian: ${new Date().toLocaleString('vi-VN')}\n`;

  fs.writeFileSync(ERROR_FILE, errorContent, 'utf-8');
  console.error(`\n📝 Đã ghi lỗi vào file: ${ERROR_FILE}`);
}

/**
 * Đọc và kiểm tra tất cả file output
 */
function checkAllOutputFiles() {
  if (!fs.existsSync(OUTPUT_FOLDER)) {
    console.log(`❌ Thư mục không tồn tại: ${OUTPUT_FOLDER}`);
    process.exit(1);
  }

  const files = fs.readdirSync(OUTPUT_FOLDER)
    .filter(file => file.endsWith('.txt'))
    .sort((a, b) => {
      // Trích xuất số đầu tiên từ tên file (ví dụ: output_C0-C19.txt -> 0)
      const getFirstNumber = (filename) => {
        const match = filename.match(/C(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getFirstNumber(a) - getFirstNumber(b);
    });

  if (files.length === 0) {
    console.log(`❌ Không tìm thấy file .txt nào trong thư mục: ${OUTPUT_FOLDER}`);
    process.exit(1);
  }

  console.log(`📁 Tìm thấy ${files.length} file(s) để kiểm tra\n`);

  for (const file of files) {
    const filePath = path.join(OUTPUT_FOLDER, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    console.log(`\n📄 Kiểm tra file: ${file}`);
    console.log('─'.repeat(60));

    const duplicates = checkDuplicateWords(content);

    if (duplicates.length === 0) {
      console.log('✅ Không có từ trùng trong file này');
    } else {
      console.error(`\n❌ LỖI: Tìm thấy ${duplicates.length} câu có từ trùng trong file "${file}":\n`);

      duplicates.forEach(result => {
        console.error(`\n  Câu ${result.sentenceIndex}:`);
        console.error(`  "${result.sentence}"`);
        console.error(`  Từ trùng:`);
        result.duplicateWords.forEach(({ word, count }) => {
          console.error(`    - "${word}" (xuất hiện ${count} lần)`);
        });
      });

      // Ghi lỗi vào file
      writeErrorToFile(file, duplicates);

      console.error('\n' + '='.repeat(60));
      console.error('❌ Dừng kiểm tra do phát hiện từ trùng!');
      process.exit(1);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Tất cả file đều không có từ trùng!');
}

/**
 * Kiểm tra một file cụ thể
 * @param {string} fileName - Tên file cần kiểm tra
 */
function checkSingleFile(fileName) {
  const filePath = path.join(OUTPUT_FOLDER, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File không tồn tại: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const duplicates = checkDuplicateWords(content);

  console.log(`📄 Kiểm tra file: ${fileName}`);
  console.log('─'.repeat(60));

  if (duplicates.length === 0) {
    console.log('✅ Không có từ trùng trong file này');
  } else {
    console.error(`\n❌ LỖI: Tìm thấy ${duplicates.length} câu có từ trùng:\n`);

    duplicates.forEach(result => {
      console.error(`\n  Câu ${result.sentenceIndex}:`);
      console.error(`  "${result.sentence}"`);
      console.error(`  Từ trùng:`);
      result.duplicateWords.forEach(({ word, count }) => {
        console.error(`    - "${word}" (xuất hiện ${count} lần)`);
      });
    });

    // Ghi lỗi vào file
    writeErrorToFile(fileName, duplicates);

    console.error('\n' + '='.repeat(60));
    console.error('❌ Phát hiện từ trùng!');
    process.exit(1);
  }
}

// Chạy script
if (require.main === module) {
  // Nếu có tham số dòng lệnh, kiểm tra file cụ thể
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    checkSingleFile(args[0]);
  } else {
    checkAllOutputFiles();
  }
}

module.exports = { checkDuplicateWords, checkAllOutputFiles, checkSingleFile };
