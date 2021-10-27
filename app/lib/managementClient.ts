import { ManagementClient } from 'auth0';

// This is the management client for retrieving users.
// The scope is different than updating the current user,
// which requires creating a new management client instance
// using the logged-in user's access token.
export const managementClient = new ManagementClient({
  domain: process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', ''),
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  scope: 'read:users', // make sure this matches the auth0 web UI config
});
