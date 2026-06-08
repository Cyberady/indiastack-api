require('dotenv').config();
const express = require('express');
const { createUser } = require('./middleware/auth');

const app = express();
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

app.use('/v1/ifsc', require('./routes/ifsc'));
app.use('/v1/pincode', require('./routes/pincode'));

app.get('/', (req, res) => {
  res.json({
    name: 'IndiaStack API',
    version: '1.0.0',
    endpoints: {
      ifsc: 'GET /v1/ifsc/:ifsc_code',
      pincode: 'GET /v1/pincode/:pincode',
      signup: 'POST /v1/signup'
    }
  });
});

app.post('/v1/signup', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: 'error', message: 'Email required' });
  }
  const user = createUser(email);
  res.json({
    status: 'success',
    message: 'Account created! You have 1000 free credits.',
    data: {
      email: user.email,
      api_key: user.apiKey,
      plan: user.plan,
      credits: user.credits
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`IndiaStack API running on http://localhost:${PORT}`);
});