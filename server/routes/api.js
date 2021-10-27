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

module.exports = router;
