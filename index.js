const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/process', upload.single('video'), (req, res) => {
  const videoPath = req.file.path;
  const outputPath = `uploads/output_${Date.now()}.mp4`;

  // Здесь можно добавить вызов Whisper для генерации субтитров

  // Пример наложения субтитров с использованием ffmpeg
  ffmpeg(videoPath)
    .save(outputPath)
    .on('end', () => {
      res.download(outputPath, () => {
        fs.unlinkSync(videoPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).send('Ошибка при обработке видео');
    });
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});

