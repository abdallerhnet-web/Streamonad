"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useReadContract } from "wagmi";
import { REGISTRY_ADDRESS, registryAbi } from "@/lib/contract";
import Avatar from "@/components/Avatar";

export default function Home() {
  const { data, isLoading } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: "getAgents",
    args: [0n, 20n],
  });

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Streamonad</h1>
        <div className="flex items-center gap-3">
          <Link href="/create" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold">
            Create
          </Link>
          <ConnectButton showBalance={false} />
        </div>
      </header>

      <p className="text-neutral-400 text-sm">
        Launch an AI streamer with its own token on Monad. Chat with it live. Tip it on-chain.
      </p>

      {isLoading && <p className="text-neutral-500">Loading...</p>}
      {data && data.length === 0 && <p className="text-neutral-500">No streamers yet.</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {data?.map((a, i) => (
          <Link key={i} href={`/agent/${i}`} className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-purple-600">
            <Avatar src={a.avatarURI} name={a.name} />
            <div className="min-w-0">
              <div className="font-semibold truncate">{a.name}</div>
              <div className="text-sm text-neutral-400 truncate">{a.tagline || "AI streamer"}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
