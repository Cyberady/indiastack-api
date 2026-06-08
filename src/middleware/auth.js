const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../data/users.json');

if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

function loadUsers() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, apiKeys: {} }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveUsers(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function generateApiKey() {
  return 'isa_' + uuidv4().replace(/-/g, '');
}

function createUser(email) {
  const db = loadUsers();
  for (const id in db.users) {
    if (db.users[id].email === email) return db.users[id];
  }
  const apiKey = generateApiKey();
  const user = {
    id: uuidv4(),
    email,
    apiKey,
    plan: 'free',
    credits: 1000,
    createdAt: new Date()
  };
  db.users[user.id] = user;
  db.apiKeys[apiKey] = user.id;
  saveUsers(db);
  return user;
}

function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({
      status: 'error',
      message: 'Missing API key. Add x-api-key header.'
    });
  }
  const db = loadUsers();
  const userId = db.apiKeys[apiKey];
  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid API key.'
    });
  }
  const user = db.users[userId];
  if (user.credits <= 0) {
    return res.status(429).json({
      status: 'error',
      message: 'No credits remaining. Please upgrade your plan.'
    });
  }
  req.user = user;
  req.db = db;
  next();
}

function deductCredit(req) {
  const db = req.db;
  db.users[req.user.id].credits -= 1;
  saveUsers(db);
}

module.exports = { authMiddleware, createUser, deductCredit };