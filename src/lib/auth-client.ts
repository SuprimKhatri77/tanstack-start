import { createAuthClient } from "better-auth/react";
console.log("better auth url: ", process.env.BETTER_AUTH_URL);
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
