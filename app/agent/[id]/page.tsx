"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { REGISTRY_ADDRESS, registryAbi } from "@/lib/contract";
import Avatar from "@/components/Avatar";
import ChatBox from "@/components/ChatBox";
import TipButton from "@/components/TipButton";
import TipFeed, { Tip } from "@/components/TipFeed";

const EXPLORER = "https://testnet.monadvision.com/address/";

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const [session, setSession] = useState<Tip[]>([]);

  const { data: a, isLoading, error, refetch } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: "getAgent",
    args: [BigInt(id)],
  });

  const onTipped = useCallback(
    (amount: string, message: string) => {
      setSession((s) => [{ from: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "you", amount, message }, ...s]);
      refetch();
    },
    [address, refetch]
  );

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-neutral-400 text-sm">← All streamers</Link>
        <ConnectButton showBalance={false} />
      </header>

      {isLoading && <p className="text-neutral-500">Loading...</p>}
      {error && <p className="text-red-400">Agent not found.</p>}

      {a && (
        <>
          <section className="flex gap-4 items-start">
            <Avatar src={a.avatarURI} name={a.name} size={80} />
            <div className="space-y-1 min-w-0">
              <h1 className="text-2xl font-bold">{a.name}</h1>
              {a.tagline && <p className="text-neutral-400">{a.tagline}</p>}
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{a.personality}</p>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm space-y-1">
            <div>Token: <a className="text-purple-400 break-all" target="_blank" href={EXPLORER + a.token}>{a.token}</a></div>
            <div>Creator: <a className="text-purple-400 break-all" target="_blank" href={EXPLORER + a.creator}>{a.creator}</a></div>
            <div>Total tips: {formatEther(a.totalTips)} MON</div>
          </section>

          <ChatBox agentId={id} name={a.name} />
          <TipButton agentId={id} onTipped={onTipped} />
          <TipFeed agentId={id} session={session} />
        </>
      )}
    </main>
  );
}
