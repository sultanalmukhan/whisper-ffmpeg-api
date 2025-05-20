const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/process', upload.single('video'), async (req, res) => {
  const videoPath = req.file.path;
  const audioPath = `${videoPath}.mp3`;
  const subtitlePath = `uploads/${Date.now()}.srt`;
  const outputPath = `uploads/output_${Date.now()}.mp4`;

  try {
    // 1. Извлекаем аудио из видео
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .output(audioPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // 2. Вызываем whisper через shell
    await new Promise((resolve, reject) => {
      exec(`whisper "${audioPath}" --language Russian --task transcribe --output_format srt --output_dir uploads`, (err, stdout, stderr) => {
        if (err) {
          console.error(stderr);
          return reject(err);
        }
        console.log(stdout);
        resolve();
      });
    });

    // 3. Находим файл с .srt (whisper его назовёт как имя файла)
    const basename = path.basename(audioPath, path.extname(audioPath));
    const generatedSubtitlePath = path.join('uploads', `${basename}.srt`);

    // 4. Накладываем субтитры на видео
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions('-vf', `subtitles=${generatedSubtitlePath}`)
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    // 5. Отправляем клиенту результат
    res.download(outputPath, () => {
      fs.unlinkSync(videoPath);
      fs.unlinkSync(audioPath);
      fs.unlinkSync(generatedSubtitlePath);
      fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при обработке видео');
  }
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
