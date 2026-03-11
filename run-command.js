const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

require("dotenv").config();

function spawnAsync(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "inherit" });
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`Exit ${code}`)),
    );
  });
}

async function runPool(tasks, concurrency = 4) {
  const queue = [...tasks]; // copy để không mutate
  let running = 0;

  return new Promise((resolve, reject) => {
    const next = () => {
      // Nếu không còn task nào và không có gì đang chạy → xong
      if (queue.length === 0 && running === 0) return resolve();

      // Nạp task mới cho đến khi đủ concurrency
      while (running < concurrency && queue.length > 0) {
        const task = queue.shift();

        running++;

        console.log(`Running task: ${task.cmd} ${task.args.join(" ")}`);

        spawnAsync(task.cmd, task.args)
          .then(() => {
            running--;
            next();
          })
          .catch(reject);
      }
    };
    next();
  });
}

// run command append file
const AUDIO_FOLDER = process.env.AUDIO_FOLDER;
const FINAL_OUTPUT_FOLDER = path.join(
  process.env.AUDIO_FOLDER,
  "..",
  "final-output",
);

const appendAudioCommand = [];

const audioFilesTxt = fs.readdirSync(AUDIO_FOLDER)
  .filter((file) => {
    return file.endsWith(".txt") && file.startsWith("audio-file-list");
  });

  audioFilesTxt.forEach((file) => {
    const number = file.match(/\d+/)?.[0];

    if (!number) return;

    appendAudioCommand.push({
      cmd: "ffmpeg",
      args: [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        path.join(AUDIO_FOLDER, `audio-file-list-${number}.txt`),
        "-c:a",
        "copy",
        "-rf64",
        "auto",
        path.join(FINAL_OUTPUT_FOLDER, `p${number}.wav`),
      ],
    });
  });

// run command create base video
const createBaseVideoCommand = [
  {
    cmd: "ffmpeg",
    args: [
      "-y",
      "-stream_loop",
      "-1",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      path.join(AUDIO_FOLDER, "..", "images", "with-logo", "image-to-video-file-list.txt"),
      "-c:v",
      "h264_nvenc",
      "-preset",
      "p1",
      "-b:v",
      "200k",
      "-r",
      "1",
      "-pix_fmt",
      "yuv420p",
      "-t",
      process.env.MAX_MINUTES,
      path.join(FINAL_OUTPUT_FOLDER, "base1.mp4"),
    ],
  },
];

// create command add audio to video
const addAudioToVideoCommand = [];

for (let index = 1; index <= audioFilesTxt.length; index++) {
  addAudioToVideoCommand.push({
    cmd: "ffmpeg",
    args: [
      "-i", path.join(FINAL_OUTPUT_FOLDER, "base1.mp4"),
      "-i", path.join(FINAL_OUTPUT_FOLDER, `p${index}.wav`),
      "-c:v", "copy",
      "-c:a", "libmp3lame",
      "-compression_level", "12",
      "-b:a", "96k",
      "-threads", "0",
      "-shortest", path.join(FINAL_OUTPUT_FOLDER, `p${index}.mp4`),
    ],
  });
}

// run all command
async function runAllCommand() {
  await runPool(appendAudioCommand, 1);
  console.log("\x1b[32m%s\x1b[0m", "Append audio command completed");
  await runPool(createBaseVideoCommand, 1);
  console.log("\x1b[32m%s\x1b[0m", "Create base video command completed");
  await runPool(addAudioToVideoCommand, 3);
  console.log("\x1b[32m%s\x1b[0m", "Add audio to video command completed");
}

runAllCommand();