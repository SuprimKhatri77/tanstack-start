import { createAuthClient } from "better-auth/react";
console.log("better auth url in client: ", process.env.VITE_BETTER_AUTH_URL);
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.VITE_BETTER_AUTH_URL || "http://localhost:3000",
});
