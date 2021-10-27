import { use, ExpressMiddleware } from 'next-api-middleware';
import slowDown from 'express-slow-down';

const withSlowDown = use(
  slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: process.env.NODE_ENV === 'development' ? 1000 : 50, // allow N requests per 15 minutes, then...
    delayMs: 500, // begin adding 500ms of delay per request above N
  }) as ExpressMiddleware
);

export default withSlowDown;
