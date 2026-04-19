const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONNIFY_BASE = 'https://sandbox.monnify.com';
const API_KEY = process.env.MONNIFY_API_KEY;
const SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;

// Get access token
async function getToken() {
  const credentials = Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString('base64');
  const res = await axios.post(`${MONNIFY_BASE}/api/v1/auth/login`, {}, {
    headers: { Authorization: `Basic ${credentials}` }
  });
  return res.data.responseBody.accessToken;
}

// Withdraw endpoint
app.post('/withdraw', async (req, res) => {
  try {
    const { amount, bankCode, accountNumber, accountName, narration } = req.body;
    const token = await getToken();
    const ref = 'SAMMY_' + Date.now();
    const response = await axios.post(`${MONNIFY_BASE}/api/v2/disbursements/single`, {
      amount, narration: narration || 'Sammy Withdrawal',
      destinationBankCode: bankCode,
      destinationAccountNumber: accountNumber,
      destinationAccountName: accountName,
      destinationNarration: 'Sammy Payout',
      sourceAccountNumber: CONTRACT_CODE,
      reference: ref, currency: 'NGN'
    }, { headers: { Authorization: `Bearer ${token}` } });
    res.json({ success: true, data: response.data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => res.send('Sammy Backend Running'));

app.listen(process.env.PORT || 3000, () => console.log('Server started'));
