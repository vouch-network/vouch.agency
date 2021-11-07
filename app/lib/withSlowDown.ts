import { use, ExpressMiddleware } from 'next-api-middleware';
import slowDown from 'express-slow-down';

const withSlowDown = (
  {
    requests = 50,
    minutes = 15,
  }: {
    requests: number;
    minutes: number;
  } = { requests: 50, minutes: 15 }
) =>
  use(
    slowDown({
      windowMs: minutes * 60 * 1000,
      delayAfter: process.env.NODE_ENV === 'development' ? 1000 : requests, // allow X requests per Y minutes, then...
      delayMs: 500, // begin adding 500ms of delay per request above X
    }) as ExpressMiddleware
  );

export default withSlowDown;
