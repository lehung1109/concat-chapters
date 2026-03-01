const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config()

const AUDIO_FOLDER = process.env.AUDIO_FOLDER;
const OUTPUT_FILE_LIST_FOLDER = process.env.OUTPUT_FILE_LIST_FOLDER;

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

// create audio file list
const files = fs.readdirSync(AUDIO_FOLDER);
const audioFileListName = 'audio-file-list.txt';
let audioFileList = [
  `file 'mo-dau.wav'`,
];
const ignoreAudioFiles = new Set([
  'mo-dau.wav',
  'giua-doan.wav',
  audioFileListName,
]);
let totalMinutes = 0;

for (const file of files) {
  if(ignoreAudioFiles.has(file)) {
    continue;
  }

  audioFileList.push(`file '${file}'`, `file 'giua-doan.wav'`);

  const duration = getWavDuration(path.join(AUDIO_FOLDER, file));
  totalMinutes += Number.parseFloat(duration.minutes);
}

// offset some minutes
totalMinutes += 3;

// log total minutes
console.log(`Total minutes: ${totalMinutes}`);

// create video files list by images files
const images = fs.readdirSync(path.join(OUTPUT_FILE_LIST_FOLDER, 'images', 'with-logo'));
const videoFileList = [
  `file 'thumbnail.jpeg'`,
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

videoFileList.push(`file 'thumbnail.jpeg'`, 'duration 3', `file 'thumbnail.jpeg'`, 'duration 3');

// write audioFileList to file
fs.writeFileSync(path.join(OUTPUT_FILE_LIST_FOLDER, 'audios', audioFileListName), audioFileList.join('\n'));

// log meaning full for audio file list
console.log('Audio file list:', audioFileList);

// write videoFileList to file
fs.writeFileSync(path.join(OUTPUT_FILE_LIST_FOLDER, 'image-to-video-file-list.txt'), videoFileList.join('\n'));

// log meaning full for video file list
console.log('Video file list:', videoFileList);