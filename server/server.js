const express = require('express');
const jwt = require('jsonwebtoken');
const Gun = require('gun');
require('gun/sea');

// implements forked version of bullet catcher with
// additional error handling
require('bullet-catcher');
require('dotenv').config();

const port = process.env.PORT || 8765;
const APP_ACCESS_TOKEN_SECRET = process.env.APP_ACCESS_TOKEN_SECRET;

const app = express();

app.use(Gun.serve);

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// verify JWT from gun message
function verifyToken(msg) {
  if (msg?.headers?.accessToken) {
    try {
      jwt.verify(msg.headers.accessToken, APP_ACCESS_TOKEN_SECRET);

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

// I copied below from some example, not sure what it was doing...
// // Sync everything
// gun.on('out', { get: { '#': { '*': '' } } });
