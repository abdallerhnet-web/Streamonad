import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "./contract";

export const wagmiConfig = getDefaultConfig({
  appName: "Streamonad",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!, // free at cloud.reown.com
  chains: [monadTestnet],
  ssr: true,
});
