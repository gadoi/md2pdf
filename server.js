import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const RARDAR_DIR = 'C:\\Users\\gd\\Downloads\\Rardar';
const UPLOADS_DIR = path.join(RARDAR_DIR, 'images');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the files directory as a static folder so the frontend can load images
app.use('/radar-files', express.static(RARDAR_DIR));

// Ensure directories exist
if (!fs.existsSync(RARDAR_DIR)) {
  try {
    fs.mkdirSync(RARDAR_DIR, { recursive: true });
  } catch (err) {
    console.error(`Could not create Rardar directory: ${err.message}`);
  }
}

if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error(`Could not create uploads directory: ${err.message}`);
  }
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ hỗ trợ tải lên các tệp tin ảnh (jpeg, jpg, png, gif, webp)!'));
  }
});

// API: Upload image
app.post('/api/upload', (req, res) => {
  const uploadSingle = upload.single('image');
  
  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Lỗi tải tệp: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Không nhận được tệp tin ảnh nào' });
    }
    
    const imageUrl = `/radar-files/images/${req.file.filename}`;
    res.json({ 
      success: true, 
      url: imageUrl,
      name: req.file.originalname 
    });
  });
});

// API: List markdown files
app.get('/api/files', (req, res) => {
  try {
    if (!fs.existsSync(RARDAR_DIR)) {
      return res.status(404).json({ error: 'Directory not found' });
    }
    const files = fs.readdirSync(RARDAR_DIR);
    const mdFiles = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const stats = fs.statSync(path.join(RARDAR_DIR, file));
        return {
          name: file,
          sizeBytes: stats.size,
          modifiedAt: stats.mtime
        };
      });
    res.json(mdFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get single file contents
app.get('/api/files/:name', (req, res) => {
  const fileName = req.params.name;
  if (!fileName.endsWith('.md') || fileName.includes('/') || fileName.includes('\\')) {
    return res.status(400).json({ error: 'Invalid file name' });
  }
  const filePath = path.join(RARDAR_DIR, fileName);
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ name: fileName, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Save file contents
app.post('/api/files/:name', (req, res) => {
  const fileName = req.params.name;
  const { content } = req.body;
  if (!fileName.endsWith('.md') || fileName.includes('/') || fileName.includes('\\')) {
    return res.status(400).json({ error: 'Invalid file name' });
  }
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }
  const filePath = path.join(RARDAR_DIR, fileName);
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ success: true, message: `File ${fileName} saved successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend SPA for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`   Markdown2PDF Kit Server is running!`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Markdown folder: ${RARDAR_DIR}`);
  console.log(`   Uploads folder: ${UPLOADS_DIR}`);
  console.log(`===================================================`);
});
