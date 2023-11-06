import * as dotenv from "dotenv";
dotenv.config();

const connection = {
  database: process.env.DATABASE_DBNAME,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
};

/**
 * @type {import('drizzle-kit').Config}
 */
export default {
  schema: "./schema.js",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    connectionString: `mysql://${connection.user}:${connection.password}@${connection.host}:3306/${connection.database}?ssl={"rejectUnauthorized":true}`,
  },
};
