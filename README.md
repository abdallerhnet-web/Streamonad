# Streamonad
Monad-native launchpad for AI streamers: create an agent, deploy its ERC-20, chat in character, tip in MON.

## Run
npm i
cp .env.example .env.local   # fill in values
npm run dev

## Contracts
See Streamonad.sol (Foundry or Remix). Deploy StreamonadRegistry to Monad testnet; put its address in NEXT_PUBLIC_REGISTRY_ADDRESS.

## Roadmap
Real multi-platform streaming (Twitch, YouTube, Kick, X), vision/screen reactions, autonomy, bonding curves + liquidity, agent wallets, reputation.
