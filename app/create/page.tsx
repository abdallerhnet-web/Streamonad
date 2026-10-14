"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEventLogs } from "viem";
import { REGISTRY_ADDRESS, registryAbi } from "@/lib/contract";

const input =
  "w-full rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-sm";

export default function CreatePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [f, setF] = useState({
    name: "",
    symbol: "",
    tagline: "",
    personality: "",
    avatar: "",
  });
  const [err, setErr] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { data: receipt, isLoading: confirming } =
    useWaitForTransactionReceipt({ hash });

  // redirect once the AgentCreated event is in the receipt
  useEffect(() => {
    if (!receipt) return;
    const logs = parseEventLogs({
      abi: registryAbi,
      logs: receipt.logs,
      eventName: "AgentCreated",
    });
    if (logs[0]) router.push(`/agent/${logs[0].args.id.toString()}`);
  }, [receipt, router]);

  const set = (k: keyof typeof f) => (e: any) => {
    const v = e.target.value as string;
    setF((p) => ({
      ...p,
      [k]: v,
      // auto-derive symbol from name until the user edits symbol manually
      ...(k === "name" && (!p.symbol || p.symbol === autoSym(p.name))
        ? { symbol: autoSym(v) }
        : {}),
    }));
  };

  function submit() {
    setErr("");
    if (!f.name.trim()) return setErr("Name required");
    if (!f.symbol.trim()) return setErr("Symbol required");
    if (!f.personality.trim()) return setErr("Personality required");
    if (f.tagline.length > 100) return setErr("Tagline max 100 chars");
    writeContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: "createAgent",
      args: [
        f.name.trim(),
        f.symbol.trim().toUpperCase(),
        f.tagline.trim(),
        f.personality.trim(),
        f.avatar.trim(),
      ],
    });
  }

  const busy = isPending || confirming;

  return (
    <main className="mx-auto max-w-xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create AI Streamer</h1>
        <ConnectButton showBalance={false} />
      </div>

      <input className={input} placeholder="Agent name" value={f.name} onChange={set("name")} />
      <input className={input} placeholder="Token symbol (e.g. LUNA)" maxLength={8} value={f.symbol}
        onChange={(e) => setF({ ...f, symbol: e.target.value.toUpperCase() })} />
      <input className={input} placeholder="Tagline (max 100)" maxLength={100} value={f.tagline} onChange={set("tagline")} />
      <textarea className={input} rows={6} placeholder="Personality / system prompt. Public on-chain." value={f.personality} onChange={set("personality")} />
      <input className={input} placeholder="Avatar image URL (https://...)" value={f.avatar} onChange={set("avatar")} />

      {f.avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={f.avatar} alt="preview" className="h-24 w-24 rounded-full object-cover" />
      )}

      {(err || error) && (
        <p className="text-red-400 text-sm">{err || error?.message.slice(0, 160)}</p>
      )}

      <button
        onClick={submit}
        disabled={!isConnected || busy}
        className="w-full rounded-lg bg-purple-600 p-3 font-semibold disabled:opacity-50"
      >
        {!isConnected ? "Connect wallet first" : isPending ? "Confirm in wallet..." : confirming ? "Deploying..." : "Create & Deploy"}
      </button>
    </main>
  );
}

function autoSym(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
}
