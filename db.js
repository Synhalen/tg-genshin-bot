import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import * as schema from "./schema.js";

const connection = connect({
  database: process.env.DATABASE_DBNAME,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

const db = drizzle(connection, {
  schema: schema,
});

export async function getCodes() {
  const codesFromDB = await db.query.oldCodes.findMany();
  return codesFromDB.map((codeFromDB) => codeFromDB.code);
}

/**
 *
 * @param {Array<string>} actualCodes
 */
export async function saveCodes(actualCodes) {
  const codesForInsert = actualCodes.map((actualCode) => {
    return { code: actualCode };
  });

  await db.transaction(async (tx) => {
    await tx.delete(schema.oldCodes);
    await tx.insert(schema.oldCodes).values(codesForInsert);
  });
}

export async function getChatIds() {
  const chatIdsFromDB = await db.query.chatIds.findMany();
  return chatIdsFromDB.map((chatId) => chatId.chatId);
}

export async function subscribeUserForNewCodes(chatId) {
  await db.insert(schema.chatIds).ignore().values({ chatId });
}

export async function unsubscribeUserFromNewCodes(chatId) {
  await db.delete(schema.chatIds).where(eq(schema.chatIds.chatId, chatId));
}
