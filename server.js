require('dotenv').config();
const express = require('express');
const multer = require('multer');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'orlinsky2026';
const CONTENT_FILE = path.join(__dirname, 'content.json');

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
  secret: process.env.SESSION_SECRET || 'orlinsky-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'media');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/[^\w\-]/g, '_').substring(0, 40);
    cb(null, base + '_' + Date.now() + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

function requireAuth(req, res, next) {
  if (req.session.authenticated) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

function readContent() {
  try {
    if (!fs.existsSync(CONTENT_FILE)) return { ru: {}, en: {}, uk: {}, reviews: [], media: {} };
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
  } catch {
    return { ru: {}, en: {}, uk: {}, reviews: [], media: {} };
  }
}

// Auth
app.get('/api/auth', (req, res) => res.json({ authenticated: !!req.session.authenticated }));

app.post('/api/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Неверный пароль' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// Content
app.get('/api/content', requireAuth, (req, res) => res.json(readContent()));

app.post('/api/content', requireAuth, (req, res) => {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

// Upload
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' });
  res.json({ path: 'media/' + req.file.filename });
});

// Media list
app.get('/api/media', requireAuth, (req, res) => {
  const dir = path.join(__dirname, 'media');
  try {
    const files = fs.readdirSync(dir)
      .filter(f => /\.(jpe?g|png|gif|webp|mp4|webm|mov)$/i.test(f))
      .map(f => {
        const stat = fs.statSync(path.join(dir, f));
        return { name: f, path: 'media/' + f, size: stat.size, mtime: stat.mtime };
      })
      .sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
    res.json(files);
  } catch {
    res.json([]);
  }
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

app.listen(PORT, () => {
  console.log(`\n  ORLINSKY Admin Server`);
  console.log(`  Сайт:        http://localhost:${PORT}`);
  console.log(`  Админ-панель: http://localhost:${PORT}/admin\n`);
});
