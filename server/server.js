const express = require('express');
const jwt = require('jsonwebtoken');
const Gun = require('gun');
require('gun/sea');

// implements forked version of bullet catcher with
// additional error handling
require('bullet-catcher');
require('dotenv').config();

const port = process.env.PORT || 8765;
const APP_KEY_PAIR = JSON.parse(process.env.APP_KEY_PAIR);
const APP_TOKEN_SECRET = process.env.APP_TOKEN_SECRET;

const app = express();
const api = require('./routes/api');

app.use('/api', api);
app.use(Gun.serve);

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// verify JWT from gun message
function verifyToken(msg) {
  if (msg?.headers?.accessToken) {
    try {
      jwt.verify(msg.headers.accessToken, APP_TOKEN_SECRET);

      return true;
    } catch (err) {
      const error = new Error('Invalid access token');

      if (err.name === 'TokenExpiredError') {
        // TODO handle expired token
        error.expiredAt = err.expiredAt;
      }

      return error;
    }
  }

  return false;
}

const gun = Gun({
  web: server,
  isValid: verifyToken,
});

// // Sync everything
// gun.on('out', { get: { '#': { '*': '' } } });

// // Authorize this app as a user
// gun.user().auth(APP_KEY_PAIR, ({ err }) => {
//   // TODO handle app auth error
//   if (err) {
//     console.error('server auth err:', err);
//   }
// });
