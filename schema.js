import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const oldCodes = sqliteTable("oldCodes", {
  code: text("code").notNull(),
});

export const chatIds = sqliteTable("chatIds", {
  chatId: text("chatId", { length: 128 }).primaryKey(),
});
