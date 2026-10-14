"use client";
import { useEffect, useRef, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { REGISTRY_ADDRESS, registryAbi } from "@/lib/contract";

export default function TipButton({
  agentId,
  onTipped,
}: {
  agentId: string;
  onTipped: (amount: string, message: string) => void;
}) {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState("0.1");
  const [message, setMessage] = useState("");
  const sent = useRef({ amount: "", message: "" });
  const done = useRef<string | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isSuccess, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && hash && done.current !== hash) {
      done.current = hash;
      onTipped(sent.current.amount, sent.current.message);
      setMessage("");
    }
  }, [isSuccess, hash, onTipped]);

  function tip() {
    sent.current = { amount, message: message.trim() };
    writeContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: "tip",
      args: [BigInt(agentId), message.trim().slice(0, 140)],
      value: parseEther(amount),
    });
  }

  const busy = isPending || confirming;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
      <div className="font-semibold">Tip this streamer</div>
      <div className="flex gap-2">
        {["0.1", "0.5", "1"].map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={"flex-1 rounded-lg border p-2 text-sm " + (amount === a ? "border-purple-500 bg-purple-900/40" : "border-neutral-700")}
          >
            {a} MON
          </button>
        ))}
      </div>
      <input
        className="w-full rounded-lg bg-neutral-800 p-2 text-sm"
        placeholder="Message (optional)"
        maxLength={140}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {error && <p className="text-red-400 text-xs">{error.message.slice(0, 140)}</p>}
      {isSuccess && <p className="text-green-400 text-sm">Tip sent!</p>}
      <button
        onClick={tip}
        disabled={!isConnected || busy}
        className="w-full rounded-lg bg-purple-600 p-2 font-semibold disabled:opacity-50"
      >
        {!isConnected ? "Connect wallet" : isPending ? "Confirm in wallet..." : confirming ? "Sending..." : `Tip ${amount} MON`}
      </button>
    </div>
  );
}
