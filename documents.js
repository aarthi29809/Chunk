import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import db from '../db.js';
import { processMarkdown } from '../utils/markdownProcessor.js';

// Get dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Set up multer for file uploads
const uploadsDir = path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Create multer upload instance with file filter
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only markdown files
    if (path.extname(file.originalname).toLowerCase() === '.md') {
      cb(null, true);
    } else {
      cb(new Error('Only markdown (.md) files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

// Get all documents
router.get('/documents', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM documents ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get a specific document
router.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Get chunks for a document
router.get('/documents/:id/chunks', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM chunks WHERE document_id = $1 ORDER BY chunk_number',
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chunks:', error);
    res.status(500).json({ error: 'Failed to fetch chunks' });
  }
});

// Get hyperlink references for a document
router.get('/documents/:id/hyperlinks', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM hyperlink_references WHERE document_id = $1',
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hyperlinks:', error);
    res.status(500).json({ error: 'Failed to fetch hyperlinks' });
  }
});

// Upload a new document
router.post('/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Create document record
    const documentResult = await db.query(
      'INSERT INTO documents (name, file_path) VALUES ($1, $2) RETURNING *',
      [req.file.originalname, req.file.path]
    );
    
    const document = documentResult.rows[0];
    
    // Process the markdown file
    const markdownContent = fs.readFileSync(req.file.path, 'utf8');
    const processedChunks = await processMarkdown(markdownContent, document.id);
    
    // Return the created document
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document: ' + error.message });
  }
});

export default router;