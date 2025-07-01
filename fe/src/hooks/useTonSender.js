import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { Sender } from "@ton/core";

export function useTonSender() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  if (!wallet) return null;

  return {
    async send(args) {
      await tonConnectUI.sendTransaction({
        messages: [
          {
            address: args.to.toString(),
            amount: args.value.toString(),
            payload: args.body?.toBoc().toString("base64") ?? "",
          },
        ],
        validUntil: Math.floor(Date.now() / 1000) + 60,
      });
    },
  };
}
