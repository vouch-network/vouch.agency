import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  async login(req, res) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
          // Need to specify scope here, for some reason nextjs-auth0
          // ignores the env variable
          scope: process.env.AUTH0_SCOPE,
        },
      });
    } catch (error) {
      res.status(error.status || 400).end(error.message);
    }
  },
});
