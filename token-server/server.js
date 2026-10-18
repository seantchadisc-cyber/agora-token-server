const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const app = express();
app.use(cors());

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

if (!APP_ID || !APP_CERTIFICATE) {
  console.error('Missing AGORA_APP_ID or AGORA_APP_CERTIFICATE env vars');
  process.exit(1);
}

app.get('/token', (req, res) => {
  const channel = req.query.channel;
  const uid = parseInt(req.query.uid) || 0;
  const role = req.query.role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  if (!channel) {
    return res.status(400).json({ error: 'channel parameter required' });
  }

  const expirationTimeInSeconds = 3600 * 24;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channel,
    uid,
    role,
    privilegeExpiredTs
  );

  res.json({ token, channel, uid });
});

app.get('/', (req, res) => {
  res.send('Agora token server is running');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Token server listening on port ${PORT}`);
});
