import { mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export const oldCodes = mysqlTable("oldCodes", {
  code: text("code").notNull(),
});

export const chatIds = mysqlTable("chatIds", {
  chatId: varchar("chatId", { length: 128 }).primaryKey(),
});
