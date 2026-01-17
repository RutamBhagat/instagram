import { env } from "@instagram/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations";
export { sql, asc, desc, eq, lte, gte, count, countDistinct, and, or } from "drizzle-orm";

export const db = drizzle(env.DATABASE_URL, {
  relations,
  casing: "snake_case",
});
