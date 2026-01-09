import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { configDotenv } from "dotenv";

configDotenv({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export { sql };
