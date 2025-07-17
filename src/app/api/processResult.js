// src/app/api/processResult.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roundId, multiplier } = req.body;
  if (!roundId || !multiplier) {
    return res.status(400).json({ error: 'Missing roundId or multiplier' });
  }

  // TODO: Add contract interaction logic here (see below)
  console.log('Received processResult request:', { roundId, multiplier });

  // For now, just return success
  return res.status(200).json({ success: true });
} 