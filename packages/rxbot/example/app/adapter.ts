// @ts-ignore
import { MemoryStorage } from "@rx-lab/storage/memory";
import { TelegramAdapter } from "@rx-lab/telegram-adapter";

const adapter = new TelegramAdapter({
  token: process.env.API_KEY,
  longPolling: true,
});

const storage = new MemoryStorage();

export { adapter, storage };
