const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const globToRegExp = require('glob-to-regexp');
const Gun = require('gun');
require('gun/sea');

// implements forked version of bullet catcher with
// additional error handling
require('bullet-catcher');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const port = process.env.PORT || 8765;
const APP_PUBLIC_KEY = process.env.APP_PUBLIC_KEY.trim();
const DISABLE_AUTH = process.env.DISABLE_AUTH === 'true';

const app = express();

app.use(Gun.serve);

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// Verify JWT in gun message
const verifyAccessToken = (accessToken) => {
  try {
    const decoded = jwt.verify(msg.headers.accessToken, APP_PUBLIC_KEY, {
      algorithm: 'RS256',
    });

    // Allow `.put` to path if path, subpath or reference tests true
    const regexp = globToRegExp(decoded.permissions, { extended: true });

    const getIsAllowed = (obj) => {
      if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        // last key will contain entire path, like:
        // parentKey/key/childKey
        const path = keys[keys.length - 1];

        if (!path) {
          return false;
        }

        if (
          regexp.test(path) ||
          // The '#' here refers to a gun ID (aka "soul") which may be
          // used to reference another node in the graph.
          // For example, if a path of 'apple' is allowed, the following
          // is also allowed:
          //  const apple = gun.get('apple').put({ type: 'fruit' })
          //  gun.get('fruit').put(apple)
          //  gun.get('red').put(apple)
          regexp.test(obj[path]['#'])
        )
          return true;

        return getIsAllowed(obj[path]);
      }

      return false;
    };

    const isAllowed = getIsAllowed(msg.put);

    return isAllowed;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return new Error('Access token expired');
    }

    return new Error('Invalid access token');
  }
};

function makeIsValid() {
  if (DISABLE_AUTH) {
    return function skipVerifyToken() {
      console.warn('Auth disabled with DISABLE_AUTH, allowing all puts');

      return true;
    };
  }

  return function verifyToken(msg) {
    if (msg?.headers?.accessToken) {
      return verifyAccessToken(msg.headers.accessToken);
    }

    return new Error('Access denied');
  };
}

const gun = Gun({
  web: server,
  isValid: makeIsValid(),
});

// I copied below from some example, not sure what it was doing...
// // Sync everything
// gun.on('out', { get: { '#': { '*': '' } } });
