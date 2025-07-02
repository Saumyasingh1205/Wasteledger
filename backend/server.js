const express = require('express');
const multer = require('multer');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(session({
  secret: 'wasteledger-secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static('uploads'));

// User storage
const USERS_FILE = path.join(__dirname, 'users.json');

const getUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]');
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
};

const saveUser = (user) => {
  const users = getUsers();
  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Multer for uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Landing Page Logic
app.get('/', (req, res) => {
  console.log("🛠 Hit the / route");
  const users = getUsers();
  console.log('➡️ Session user:', req.session.user);
  console.log('➡️ Users list:', users);

  if (!req.session.user) {
    if (users.length === 0) {
      console.log('🟢 Showing register.html');
      return res.sendFile(path.join(__dirname, '../frontend/register.html'));
    }
    console.log('🟡 Showing login.html');
    return res.sendFile(path.join(__dirname, '../frontend/login.html'));
  }

  console.log('🔵 Showing index.html');
  return res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.use(express.static(path.join(__dirname, '../frontend')));

// Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  saveUser({ name, email, password });
  res.status(200).json({ message: 'Registered successfully' });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  req.session.user = user;
  res.status(200).json({ message: 'Login successful' });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Waste Pickup Report
app.post('/api/report', upload.single('image'), (req, res) => {
  const { name, location, address, latitude, longitude, wastetype, details } = req.body;
  const image = req.file?.filename;
  console.log("Pickup Request:", { name, location, wastetype, details, image });
  res.status(200).send({ message: 'Pickup request received!' });
});

// Municipal Worker Upload
app.post('/api/municipal', upload.single('image'), (req, res) => {
  const { workerId, location, workerAddress, workerLat, workerLng, timestamp, notes } = req.body;
  const image = req.file?.filename;
  console.log("Municipal Proof:", { workerId, location, timestamp, notes, image });
  res.status(200).send({ message: 'Proof uploaded!' });
});

// Contact Form
app.post('/contact', (req, res) => {
  const { email, message } = req.body;
  const newMessage = {
    email,
    message,
    timestamp: new Date().toISOString()
  };

  const messagesFile = path.join(__dirname, 'messages.json');
  if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, '[]');
  }

  const existingMessages = JSON.parse(fs.readFileSync(messagesFile, 'utf-8'));
  existingMessages.push(newMessage);
  fs.writeFileSync(messagesFile, JSON.stringify(existingMessages, null, 2));

  console.log('Contact Message Saved:', newMessage);
  res.status(200).send({ message: 'Message received and stored. Thank you!' });
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
