const express = require('express');
const slowDown = require('express-slow-down');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const SEA = require('gun/sea');
const { GUN_PATH } = require('../constants');

const APP_ACCESS_KEY_PAIR = JSON.parse(process.env.APP_ACCESS_KEY_PAIR);
const APP_ACCESS_TOKEN_SECRET = process.env.APP_ACCESS_TOKEN_SECRET;

const router = express.Router();

// if you're allowing gun access to more than one http origin,
// you'll want to make sure that CORs for API routes is configured
let allowList = (process.env.CORS_ALLOW_LIST || '').split(',');

const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (allowList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
});

router.use(
  slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: process.env.NODE_ENV === 'development' ? 1000 : 50, // allow N requests per 15 minutes, then...
    delayMs: 500, // begin adding 500ms of delay per request above N
  })
);

router.use(corsMiddleware);
router.options('*', corsMiddleware);
router.use(express.json());

router.post('/certificates', async (req, res) => {
  const { username, pub: userPubKey } = req.body;

  // See https://gun.eco/docs/SEA.certify for policies
  const policy = [
    // allow users to add and edit their profiles with:
    //   gun
    //     .get('~'+gunApp.pub)
    //     .get('profiles')
    //     .get(user.pub)
    //     .put({ name: 'alice' }, null, {opt: { cert: certificate }} )
    { '*': GUN_PATH.profiles },
    { '*': GUN_PATH.vouches },
    // TODO chat
  ];

  // expire in 2 hours
  const expiresAt = Date.now() + 60 * 60 * 1000 * 2;

  const certificate = await SEA.certify(
    [userPubKey],
    policy,
    APP_ACCESS_KEY_PAIR,
    ({ err }) => {
      if (process.env.NODE_ENV === 'development') {
        if (err) {
          console.log(`Error creating certificate for ${username}:`, err);
        } else {
          console.log(`Successfully created certificate for ${username}`);
        }
      }
    },
    // FIXME neither expiry or block seem to be working?
    // https://github.com/amark/gun/issues/1143
    {
      expiry: expiresAt,
      // name of path to blocked/banned users
      block: 'blocked',
    }
  );

  res.status(201).send({
    certificate,
    expires_at: expiresAt,
  });
});

router.post('/tokens', (req, res) => {
  const { username, pub } = req.body;

  const token = jwt.sign({ username, pub }, APP_ACCESS_TOKEN_SECRET, {
    expiresIn: '2h',
  });

  res.status(201).send({
    accessToken: token,
  });
});

module.exports = router;
