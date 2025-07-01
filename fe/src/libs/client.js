import { TonClient } from "@ton/ton";

// Create one shared client instance for testnet
export const tonClient = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: import.meta.env.VITE_TON_API_KEY,
});
