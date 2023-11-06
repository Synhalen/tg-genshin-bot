import dotenv from "dotenv";
dotenv.config();

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",
});

import puppeteer from "puppeteer";
import TelegramBot from "node-telegram-bot-api";
import { proGameGuides, landOfGames } from "./parsers.js";
import {
  getCodes,
  saveCodes,
  getChatIds,
  subscribeUserForNewCodes,
  unsubscribeUserFromNewCodes,
} from "./db.js";

const token = process.env.TG_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Выберите действие:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Хочу узнать активные промокоды",
            callback_data: "active_codes",
          },
        ],

        [
          {
            text: "Присылай мне новые промокоды",
            callback_data: "subscribe",
          },
        ],

        [
          {
            text: "Отменить подписку",
            callback_data: "unsubscribe",
          },
        ],
      ],
    },
  });
});

const chatCallbacks = {
  active_codes: async (query) => {
    const oldCodes = await getCodes();

    const activeCodesMessage = oldCodes.join("\n"); //строка промокодов

    await bot.sendMessage(
      query.message.chat.id,
      `Активные помокоды:\n${activeCodesMessage}`
    );
  },

  subscribe: async (query) => {
    await subscribeUserForNewCodes(query.message.chat.id);
    await bot.answerCallbackQuery(query.id, { text: "Уведомления подключены" });
  },

  unsubscribe: async (query) => {
    await unsubscribeUserFromNewCodes(query.message.chat.id);
    await bot.answerCallbackQuery(query.id, { text: "Уведомления отключены" });
  },
};

bot.on("callback_query", async (query) => {
  const fn = chatCallbacks[query.data];
  await fn(query);
});

async function fetchNewCodes() {
  const browser = await puppeteer.launch({
    // `headless: true`  // (default) enables old Headless;
    headless: "new", // enables new Headless;
    // headless: false, // enables “headful” mode.
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    let codes = await Promise.all([
      proGameGuides(browser),
      landOfGames(browser),
    ]);
    let receivedNewCodes = new Set(codes.flat());
    return receivedNewCodes;
  } finally {
    await browser.close();
  }
}

function getCodesForNotification(oldCodes, receivedNewCodes) {
  let codesForNotification = [];
  for (let code of receivedNewCodes) {
    if (!oldCodes.includes(code)) {
      codesForNotification.push(code);
    }
  }
  return codesForNotification;
}

const UDPATE_INTERVAL = 2 * 60 * 60 * 1000;

async function updateCodes(oldCodes) {
  const receivedNewCodes = await fetchNewCodes();
  const codesForNotifications = getCodesForNotification(
    oldCodes,
    receivedNewCodes
  );

  return { codesForNotifications, receivedNewCodes };
}

function isBotBlockedError(error) {
  return error?.response?.statusCode === 403;
}

async function sendNewCodesToUsers(codesForNotifications, chatIds) {
  for (let chatId of chatIds) {
    try {
      await bot.sendMessage(
        chatId,
        `Новые промокоды:\n${codesForNotifications.join("\n")}`
      );
    } catch (error) {
      if (isBotBlockedError(error)) {
        await unsubscribeUserFromNewCodes(chatId);
      } else {
        console.error(error);
      }
    }
  }
}

async function downloadNewCodesAndNotifyUsers() {
  const oldCodes = await getCodes();

  const { codesForNotifications, receivedNewCodes } =
    await updateCodes(oldCodes);
  await saveCodes([...receivedNewCodes]);

  if (codesForNotifications.length > 0) {
    const chatIds = await getChatIds();
    await sendNewCodesToUsers(codesForNotifications, chatIds);
  }
}

setInterval(downloadNewCodesAndNotifyUsers, UDPATE_INTERVAL);
downloadNewCodesAndNotifyUsers();
