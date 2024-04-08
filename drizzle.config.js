import "dotenv/config";

/**
 * @type {import('drizzle-kit').Config}
 */
export default {
  schema: "./schema.js",
  out: "./drizzle",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
};
