import { defineChain, parseAbi } from "viem";

// Verified against https://docs.monad.xyz/developer-essentials/testnets
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
  blockExplorers: {
    default: { name: "MonadVision", url: "https://testnet.monadvision.com" },
  },
  testnet: true,
});

export const REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`;

const AGENT =
  "(address creator,address token,uint64 createdAt,uint256 totalTips,string name,string tagline,string personality,string avatarURI)";

export const registryAbi = parseAbi([
  "function createAgent(string name,string symbol,string tagline,string personality,string avatarURI) returns (uint256 id,address token)",
  "function tip(uint256 id,string message) payable",
  `function getAgent(uint256 id) view returns (${AGENT})`,
  `function getAgents(uint256 start,uint256 limit) view returns (${AGENT}[])`,
  "function getAgentsByCreator(address creator) view returns (uint256[])",
  "function agentCount() view returns (uint256)",
  "event AgentCreated(uint256 indexed id,address indexed creator,address token,string name)",
  "event Tipped(uint256 indexed id,address indexed from,uint256 amount,string message)",
]);
