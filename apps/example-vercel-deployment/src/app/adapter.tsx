import { FileStorage } from "@rx-lab/file-storage";
import { TelegramAdapter } from "@rx-lab/telegram-adapter";

const apiKey = process.env.API_KEY ?? process.env.TG_BOT_API_KEY;
if (!apiKey) {
  throw new Error(
    "Missing API KEY, please set either API_KEY or TG_BOT_API_KEY in .env file",
  );
}

const adapter = new TelegramAdapter({
  token: apiKey,
  longPolling: true,
});

const storage = new FileStorage();

export { adapter, storage };
