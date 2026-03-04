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
      text = text.replaceAll('[', '');
      text = text.replaceAll(']', '');
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
      text = text.replace(/xumg/gi, 'xung');
      text = text.replace(/dejavu/gi, 'đê gia vu');
      text = text.replace(/khura/gi, 'khuya');
      text = text.replace(/menu/gi, 'mê nu');
      text = text.replace(/haii/gi, 'hai');
      text = text.replace(/com/gi, 'cơm');
      text = text.replace(/rra/gi, 'ra');
      text = text.replace(/thuye/gi, 'thuyên');
      text = text.replace(/ozawa/gi, 'ô gia woa');
      text = text.replace(/maria/gi, 'ma ri a');
      text = text.replace(/khoit/gi, 'khỏi');
      text = text.replace(/crar/gi, 'của');
      text = text.replace(/tronh/gi, 'trong');
      text = text.replace(/hamster/gi, 'ham tơ');
      text = text.replace(/series/gi, 'sê ri');
      text = text.replace(/thig/gi, 'thì');
      text = text.replace(/hanshui/gi, 'han sui');
      text = text.replace(/chunh/gi, 'chung');
      text = text.replace(/hydro/gi, 'hy đờ rô');
      text = text.replace(/tronga/gi, 'trong');
      text = text.replace(/kh /gi, 'khi ');
      text = text.replace(/phongm/gi, 'phong');
      text = text.replace(/kh8/gi, 'khi');
      text = text.replace(/luii/gi, 'lui');
      text = text.replace(/yei6/gi, 'yeu');
      text = text.replace(/hona/gi, 'hoan');
      text = text.replace(/tohng/gi, 'thong');
      text = text.replace(/ea/gi, 'e');
      text = text.replace(/khii/gi, 'khi');
      text = text.replace(/nhna/gi, 'nhanh');
      text = text.replace(/snh/gi, 'sinh');
      text = text.replace(/caoa/gi, 'cao');
      text = text.replace(/dunh/gi, 'dung');
      text = text.replace(/alnh/gi, 'lanh');
      text = text.replace(/kys/gi, 'kỳ');
      text = text.replace(/trongg/gi, 'trong');
      text = text.replace(/thoe/gi, 'theo');
      text = text.replace(/torng/gi, 'trong');
      text = text.replace(/tsf/gi, '');
      text = text.replace(/hanf/gi, 'hàn');
      text = text.replace(/tronng/gi, 'trong');
      text = text.replace(/mma2/gi, 'mà');
      text = text.replace(/fgiap1/gi, 'giáp');
      text = text.replace(/coay/gi, 'xoay');
      text = text.replace(/thur/gi, 'thủ');
      text = text.replace(/aay/gi, 'chạy');
      text = text.replace(/nhue/gi, 'như');
      text = text.replace(/suq/gi, 'sau');
      text = text.replace(/cabhr/gi, 'cảnh');
      text = text.replace(/v3/gi, 'vẻ');
      text = text.replace(/trrong/gi, 'trong');
      text = text.replace(/qune/gi, 'quen');
      text = text.replace(/chp/gi, 'cho');
      text = text.replace(/trog/gi, 'trong');
      text = text.replace(/saoo/gi, 'sao');
      text = text.replace(/babababa/gi, 'ba ba');
      text = text.replace(/sauk/gi, 'sau');
      text = text.replace(/Trần Triệt/gi, 'Trần Minh Triệt');
      text = text.replace(/Lý Vân/gi, 'Lý Thanh Vân');
      text = text.replace(/Vương Kiệt/gi, 'Vương Tuấn Kiệt');
      text = text.replace(/Tiêu Nhiên/gi, 'Tiêu Hạo Nhiên');
      text = text.replace(/Trần Bá/gi, 'Trần Quốc Bá');
      text = text.replace(/Lưu Khang/gi, 'Lưu Đức Khang');
      text = text.replace(/Hàn Sơn/gi, 'Hàn Thiên Sơn');
      text = text.replace(/qu /gi, 'qua ');
      text = text.replace(/minhl/gi, 'minh');
      text = text.replace(/ nh /gi, '');
      text = text.replace(/manhn/gi, 'manh');
      text = text.replace(/phuch/gi, 'phục');
      text = text.replace(/ioiy/gi, '');
      text = text.replace(/ngy/gi, '');
      text = text.replace(/bbij/gi, '');
      text = text.replace(/biehi/gi, '');
      text = text.replace(/copng/gi, '');
      text = text.replace(/saop/gi, '');
      text = text.replace(/cuar/gi, 'của');
      text = text.replace(/laij/gi, 'lại');
      text = text.replace(/vs/gi, 'với');
      text = text.replace(/copnf/gi, '');
      text = text.replace(/khihai/gi, 'khí hải');
      text = text.replace(/mnhf/gi, '');
      text = text.replace(/tthif/gi, 'thi');
      text = text.replace(/qia/gi, '');
      text = text.replace(/ny/gi, 'người yêu');
      text = text.replace(/ngoiaxn/gi, 'ngoại');
      text = text.replace(/loaij/gi, 'loại');
      text = text.replace(/khbi/gi, 'không biết');
      text = text.replace(/kich/gi, 'kích');
      text = text.replace(/syu/gi, 'sưu');
      text = text.replace(/ddaxx/gi, 'đã');
      text = text.replace(/thif/gi, 'thì');
      text = text.replace(/phari/gi, 'phải');
      text = text.replace(/thawrng/gi, 'thẳng');
      text = text.replace(/ko/gi, 'không');
      text = text.replace(/chri/gi, 'chỉ');
      text = text.replace(/phuowg/gi, 'phương');
      text = text.replace(/sauy/gi, 'suy');
      text = text.replace(/nhwung/gi, 'nhưng');
      text = text.replace(/dluy/gi, 'lụy');
      text = text.replace(/bvux/gi, 'vũ');
      text = text.replace(/ddan/gi, 'đan');
      text = text.replace(/giaps/gi, 'giáp');
      text = text.replace(/luan/gi, 'luân');
      text = text.replace(/qanhs/gi, 'quanh');
      text = text.replace(/tangt/gi, 'tăng');
      text = text.replace(/truocs/gi, 'trước');
      text = text.replace(/phongg/gi, 'phong');
      text = text.replace(/leng/gi, 'lên');
      text = text.replace(/cunghai/gi, 'cùng hai');
      text = text.replace(/kai/gi, 'cái');
      text = text.replace(/up/gi, 'lên');
      text = text.replace(/twhs/gi, 'thế');
      text = text.replace(/shit/gi, 'tệ');
      text = text.replace(/sauy/gi, 'suy');
      text = text.replace(/boom/gi, 'nổ');
      text = text.replace(/vv/gi, 'vân vân');
      text = text.replace(/sp0/gi, 'hỗ trợ');
      text = text.replace(/niu/gi, 'nịu');
      text = text.replace(/th /gi, 'thì ');
      text = text.replace(/xumg/gi, 'xung');
      text = text.replace(/nua/gi, 'nữa');
      text = text.replace(/nhan/gi, 'nhận');
      text = text.replace(/doong/gi, 'đong');
      text = text.replace(/luu/gi, 'lưu');
      text = text.replace(/phap/gi, 'pháp');
      text = text.replace(/khong/gi, 'không');
      text = text.replace(/haa/gi, 'ha');
      text = text.replace(/thien/gi, 'thiên');
      text = text.replace(/uay/gi, 'uầy');
      text = text.replace(/khura/gi, 'khựa');
      text = text.replace(/rat/gi, 'rất');
      text = text.replace(/xoau/gi, 'xoáo');
      text = text.replace(/linht/gi, 'linh');
      text = text.replace(/phuc/gi, 'phúc');
      text = text.replace(/xue/gi, 'xuê');
      text = text.replace(/sat/gi, 'sát');
      text = text.replace(/chin/gi, 'chín');
      text = text.replace(/maf/gi, 'mà');
      text = text.replace(/loai/gi, 'loại');
      text = text.replace(/fcos/gi, 'có');
      text = text.replace(/ua/gi, 'ưa');
      text = text.replace(/t5a/gi, 'ta');
      text = text.replace(/phan/gi, 'phần');
      text = text.replace(/coong/gi, 'công');
      text = text.replace(/tavung/gi, 'ta vung');
      text = text.replace(/kyd/gi, 'kỳ');
      text = text.replace(/vonv/gi, 'vốn');
      text = text.replace(/baoaau/gi, 'bao lâu');
      text = text.replace(/hoam/gi, 'hoàm');
      text = text.replace(/hoach/gi, 'hoạch');
      text = text.replace(/gioa/gi, 'giao');
      text = text.replace(/ding/gi, 'định');
      text = text.replace(/rtrong/gi, 'trong');
      text = text.replace(/snghi/gi, 'suy nghĩ');
      text = text.replace(/mnootj/gi, 'một');
      text = text.replace(/saothanh/gi, 'sao thành');
      text = text.replace(/nghin/gi, 'nghìn');
      text = text.replace(/ton/gi, 'tồn');
      text = text.replace(/sua/gi, 'sửa');
      text = text.replace(/veienj/gi, 'viện');
      text = text.replace(/leaij/gi, 'lại');
      text = text.replace(/kacs/gi, 'các');
      text = text.replace(/nhien/gi, 'nhiên');
      text = text.replace(/ning/gi, 'nình');
      text = text.replace(/kiakkinh/gi, 'kia kìa');
      text = text.replace(/khic/gi, 'khích');
      text = text.replace(/thn/gi, 'thần');
      text = text.replace(/hinh/gi, 'hình');
      text = text.replace(/thaoaj/gi, 'thao');
      text = text.replace(/thin/gi, 'tin');
      text = text.replace(/tma/gi, 'tạm');
      text = text.replace(/mon/gi, 'mòn');
      text = text.replace(/ra1/gi, 'ra');
      text = text.replace(/slinh/gi, 'sinh');
      text = text.replace(/phuong/gi, 'phương');
      text = text.replace(/xna/gi, 'xưa');
      text = text.replace(/luongj/gi, 'lương');
      text = text.replace(/vog/gi, 'vô');
      text = text.replace(/sao>/gi, 'sao');
      text = text.replace(/qury/gi, 'quy');
      text = text.replace(/bne/gi, 'bạn');
      text = text.replace(/nnghe/gi, 'nghe');
      text = text.replace(/mfu/gi, 'màu');
      text = text.replace(/kawcs/gi, 'khác');
      text = text.replace(/kucs/gi, 'cúc');
      text = text.replace(/trm/gi, 'trầm');
      text = text.replace(/sownt/gi, 'sống');
      text = text.replace(/trwoar/gi, 'trượt');
      text = text.replace(/tihcs/gi, 'thích');
      text = text.replace(/quna/gi, 'quân');
      text = text.replace(/phia/gi, 'phía');
      text = text.replace(/but/gi, 'bút');
      text = text.replace(/did/gi, 'đi');
      text = text.replace(/lom/gi, 'lòm');
      text = text.replace(/vuong/gi, 'vương');
      text = text.replace(/ngtao/gi, 'người tạo');
      text = text.replace(/gian\//gi, 'gian');
      text = text.replace(/oh/gi, 'ồ');
      text = text.replace(/ea/gi, 'ê');
      text = text.replace(/cuar/gi, 'của');
      text = text.replace(/ahh/gi, 'à');
      text = text.replace(/eq/gi, 'ê');
      text = text.replace(/3d/gi, '3 chiều');
      text = text.replace(/zombie/gi, 'xác sống');
      text = text.replace(/fan/gi, 'người hâm mộ');
      text = text.replace(/follow/gi, 'theo dõi');
      text = text.replace(/fanclub/gi, 'câu lạc bộ');
      text = text.replace(/chip/gi, 'mạch vi xử lý');
      text = text.replace(/sunfuric/gi, 'a xít');
      text = text.replace(/bowling/gi, 'ném bi');
      text = text.replace(/rubik/gi, 'ru bích');
      text = text.replace(/internet/gi, 'mạng');
      text = text.replace(/sofa/gi, 'ghế đệm');
      text = text.replace(/hd/gi, 'độ phân giải cao');
      text = text.replace(/silicon/gi, 'si líc');
      text = text.replace(/blogger/gi, 'người viết bờ lóc');
      text = text.replace(/online/gi, 'trực tuyến');
      text = text.replace(/livestrem/gi, 'phát trực tiếp');

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
