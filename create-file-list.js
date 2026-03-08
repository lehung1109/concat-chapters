const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config()

const AUDIO_FOLDER = process.env.AUDIO_FOLDER;
const OUTPUT_FILE_LIST_FOLDER = process.env.OUTPUT_FILE_LIST_FOLDER;
const NUMBER_FILE_TO_ADD_STOP = process.env.NUMBER_FILE_TO_ADD_STOP;

function getWavDuration(filePath) {
  const buffer = Buffer.alloc(44);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 44, 0);
  fs.closeSync(fd);

  const sampleRate = buffer.readUInt32LE(24);   // byte 24-27
  const numChannels = buffer.readUInt16LE(22);  // byte 22-23
  const bitsPerSample = buffer.readUInt16LE(34); // byte 34-35
  const dataSize = buffer.readUInt32LE(40);      // byte 40-43

  const durationSeconds = dataSize / (sampleRate * numChannels * (bitsPerSample / 8));
  const durationMinutes = durationSeconds / 60;

  return {
    seconds: durationSeconds.toFixed(2),
    minutes: durationMinutes.toFixed(2),
  };
}

// Mỗi 11h tạo 1 file list
const HOURS_PER_FILE_LIST = 10;
const MINUTES_PER_FILE_LIST = HOURS_PER_FILE_LIST * 60; // 660

const ignoreAudioFiles = new Set([
  'mo-dau.wav',
  'giua-doan.wav',
]);
const files = fs.readdirSync(AUDIO_FOLDER).filter(isAudioFile).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

function isAudioFile(name) {
  if (ignoreAudioFiles.has(name)) return false;
  if (name.startsWith('audio-file-list') && name.endsWith('.txt')) return false;
  return /\.(wav|mp3|m4a|flac)$/i.test(name);
}

const audiosDir = path.join(OUTPUT_FILE_LIST_FOLDER, 'audios');

if (!fs.existsSync(audiosDir)) {
  fs.mkdirSync(audiosDir, { recursive: true });
}

let currentList = [`file 'mo-dau.wav'`];
let currentMinutes = 0;
let listIndex = 1;
let totalMinutes = 0;

for (let i = 0; i < files.length; i++) {
  const file = files[i];

  currentList.push(`file '${file}'`);

  if (i % Number(NUMBER_FILE_TO_ADD_STOP) === 0) {
    currentList.push(`file 'giua-doan.wav'`);
  }

  const duration = getWavDuration(path.join(AUDIO_FOLDER, file));
  const mins = Number.parseFloat(duration.minutes);
  currentMinutes += mins;
  totalMinutes += mins;

  // Đủ 11h → ghi file list hiện tại, bắt đầu list mới
  if (currentMinutes >= MINUTES_PER_FILE_LIST) {
    currentList.push(`file 'giua-doan.wav'`);

    const fileName = `audio-file-list-${listIndex}.txt`;

    fs.writeFileSync(path.join(audiosDir, fileName), currentList.join('\n'));

    console.log(`✓ ${fileName} (~${currentMinutes.toFixed(0)} phút)`);

    listIndex++;
    currentList = [];
    currentMinutes = 0;
  }
}

// Phần còn lại (< 11h)
if (currentList.length > 0) {
  currentList.push(`file 'giua-doan.wav'`);

  const fileName = `audio-file-list-${listIndex}.txt`;

  fs.writeFileSync(path.join(audiosDir, fileName), currentList.join('\n'));

  console.log(`✓ ${fileName} (~${currentMinutes.toFixed(0)} phút)`);
}

// offset some minutes
totalMinutes += 3;

console.log(`Tổng: ${listIndex} file list, tổng ~${totalMinutes.toFixed(0)} phút`);

// create video files list by images files
const images = fs.readdirSync(path.join(OUTPUT_FILE_LIST_FOLDER, 'images', 'with-logo')).filter(image => image.endsWith('.jpg'));
const videoFileList = [
  `file 'thumbnail.jpg'`,
  'duration 12'
];

// get all image files
const imageList = [];

for (const image of images) {
  imageList.push(image);
}

// loop through each 30minutes
for (let i = 0; i < totalMinutes; i += 30) {
  const imageIndex = Math.floor((i / 30) % 8);

  videoFileList.push(`file '${imageList[imageIndex]}'`, 'duration 1800');
}

videoFileList.push(`file 'thumbnail.jpg'`, 'duration 3', `file 'thumbnail.jpg'`, 'duration 3');

// write videoFileList to file
fs.writeFileSync(path.join(OUTPUT_FILE_LIST_FOLDER, 'images', 'with-logo', 'image-to-video-file-list.txt'), videoFileList.join('\n'));

// log meaning full for video file list
console.log('Video file list:', videoFileList);