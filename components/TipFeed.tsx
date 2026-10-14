"use client";
import { useEffect, useState } from "react";
import { formatEther, parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { REGISTRY_ADDRESS } from "@/lib/contract";

export type Tip = { from: string; amount: string; message: string };

const tippedEvent = parseAbiItem(
  "event Tipped(uint256 indexed id,address indexed from,uint256 amount,string message)"
);

const short = (a: string) => (a.length > 10 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a);

export default function TipFeed({ agentId, session }: { agentId: string; session: Tip[] }) {
  const client = usePublicClient();
  const [past, setPast] = useState<Tip[]>([]);

  useEffect(() => {
    if (!client) return;
    (async () => {
      try {
        const latest = await client.getBlockNumber();
        const fromBlock = latest > 5000n ? latest - 5000n : 0n;
        const logs = await client.getLogs({
          address: REGISTRY_ADDRESS,
          event: tippedEvent,
          args: { id: BigInt(agentId) },
          fromBlock,
          toBlock: latest,
        });
        setPast(
          logs
            .slice(-10)
            .reverse()
            .map((l) => ({
              from: short(l.args.from as string),
              amount: formatEther(l.args.amount as bigint),
              message: (l.args.message as string) || "",
            }))
        );
      } catch {
        // RPC range limit etc: fall back to session tips only
      }
    })();
  }, [client, agentId]);

  const all = [...session, ...past].slice(0, 10);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-2">
      <div className="font-semibold">Recent tips</div>
      {all.length === 0 && <p className="text-sm text-neutral-500">No tips yet. Be the first.</p>}
      {all.map((t, i) => (
        <div key={i} className="text-sm flex justify-between gap-2">
          <span className="truncate">
            <span className="text-neutral-400">{t.from}</span> {t.message && <span>: {t.message}</span>}
          </span>
          <span className="text-purple-400 shrink-0">{t.amount} MON</span>
        </div>
      ))}
    </div>
  );
}
