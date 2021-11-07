const express = require('express');
const jwt = require('jsonwebtoken');
const globToRegExp = require('glob-to-regexp');
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
      const decoded = jwt.verify(
        msg.headers.accessToken,
        APP_ACCESS_TOKEN_SECRET
      );

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
      console.log(err);
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
