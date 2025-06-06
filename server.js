// server.js

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Create uploads folder if not exists
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original file name
  }
});

// Filter to accept only png, jpg, jpeg
const fileFilter = function (req, file, cb) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpeg, and .jpg files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Route to handle pickup requests
app.post('/api/request-pickup', upload.single('photo'), (req, res) => {
  console.log('Request Body:', req.body);
  console.log('Uploaded File:', req.file);

  if (!req.file) {
    return res.status(400).json({ error: 'No valid image uploaded. Only .png, .jpg, and .jpeg are allowed.' });
  }

  // You can also store this info in a DB or do blockchain stuff here
  res.status(200).json({
    message: 'Pickup request submitted successfully!',
    filename: req.file.originalname,
    details: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
