const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Setup file upload storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Citizen waste pickup submission
app.post('/api/report', upload.single('image'), (req, res) => {
  const { name, location, type, details } = req.body;
  const image = req.file?.filename;
  console.log("Pickup Request:", { name, location, type, details, image });
  res.status(200).send({ message: 'Pickup request received!' });
});

// Municipal worker upload
app.post('/api/municipal', upload.single('image'), (req, res) => {
  const { workerId, location, timestamp, notes } = req.body;
  const image = req.file?.filename;
  console.log("Municipal Proof:", { workerId, location, timestamp, notes, image });
  res.status(200).send({ message: 'Proof uploaded!' });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
