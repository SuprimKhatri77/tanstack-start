import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { tanstackStartCookies } from "better-auth/tanstack-start";

console.log("better auth url: ", process.env.BETTER_AUTH_URL);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [tanstackStartCookies()],
});
