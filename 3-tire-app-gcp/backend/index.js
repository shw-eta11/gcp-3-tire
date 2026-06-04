const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ 1. CORS must come first
app.use(cors({
  origin: 'https://frontend-588700579228.asia-south1.run.app' // frontend ALB
}));

// ✅ 2. Parse JSON
app.use(express.json());

// ✅ 3. Database setup
const db = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Wait for DB to be ready
const waitForDB = () => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.log('Waiting for database...');
      setTimeout(waitForDB, 5000);
    } else {
      console.log('Connected to MySQL');
      runInitSQL();
    }
  });
};
waitForDB();

const runInitSQL = () => {
  const sqlPath = path.join(__dirname, 'db', 'init.sql');
  const initSQL = fs.readFileSync(sqlPath, 'utf8');

  db.query(initSQL, (err) => {
    if (err) {
      console.error('Init SQL failed:', err);
    } else {
      console.log('Init SQL executed successfully');
    }
  });
};

// Test initial connection
db.getConnection((err, connection) => {
  if (err) console.error('DB connection failed:', err);
  else {
    console.log('Connected to MySQL');
    connection.release();
  }
});

// ✅ 4. Routes

// Get all categories
app.get('/api/categories', (req, res) => {
  db.query('SELECT * FROM categories ORDER BY id ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ categories: results, total: results.length });
  });
});

// Get all messages with category details
app.get('/api/messages', (req, res) => {
  const query = `
    SELECT 
      m.id, 
      m.message, 
      m.author, 
      m.status,
      m.created_at,
      m.updated_at,
      c.id as category_id,
      c.name as category_name,
      c.color as category_color,
      c.description as category_description
    FROM messages m
    JOIN categories c ON m.category_id = c.id
    WHERE m.status = 'active'
    ORDER BY m.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ messages: results, total: results.length });
  });
});

// Get messages by category
app.get('/api/messages/category/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  const query = `
    SELECT 
      m.id, 
      m.message, 
      m.author, 
      m.status,
      m.created_at,
      m.updated_at,
      c.id as category_id,
      c.name as category_name,
      c.color as category_color
    FROM messages m
    JOIN categories c ON m.category_id = c.id
    WHERE m.category_id = ? AND m.status = 'active'
    ORDER BY m.created_at DESC
  `;
  
  db.query(query, [categoryId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ messages: results, total: results.length });
  });
});

// Create new message
app.post('/api/messages', (req, res) => {
  const { message, category_id, author } = req.body;
  
  if (!message || !category_id) {
    return res.status(400).json({ error: 'Message and category_id required' });
  }

  const authorName = author || 'User';
  const query = 'INSERT INTO messages (message, category_id, author) VALUES (?, ?, ?)';
  
  db.query(query, [message, category_id, authorName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ 
      id: results.insertId, 
      message, 
      category_id, 
      author: authorName,
      created_at: new Date().toISOString()
    });
  });
});

// Update message status
app.put('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['active', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Valid status required' });
  }

  db.query('UPDATE messages SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Message updated' });
  });
});

// Delete message (soft delete)
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE messages SET status = "archived" WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Message archived' });
  });
});

app.get('/api/health', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) return res.status(500).json({ status: 'fail', database: 'unreachable', error: err });
    res.json({ status: 'ok', database: 'reachable' });
  });
});

// ✅ 5. Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
