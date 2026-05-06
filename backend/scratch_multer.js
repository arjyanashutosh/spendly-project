const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), (req, res) => {
  res.send('ok');
});

app.use((err, req, res, next) => {
  console.error("EXPRESS ERROR HANDLER:", err.message);
  res.status(500).send(err.message);
});

app.listen(3000, () => console.log('started'));
