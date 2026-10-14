"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatBox({ agentId, name }: { agentId: string; name: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send() {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next);
    setText("");
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentId, messages: next }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "chat failed");
      setMsgs([...next, { role: "assistant", content: d.reply }]);
    } catch (e: any) {
      setErr(e.message?.slice(0, 120) || "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {msgs.length === 0 && <p className="text-neutral-500">Say hi to {name}...</p>}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span className={"inline-block rounded-lg px-3 py-2 max-w-[85%] text-left " + (m.role === "user" ? "bg-purple-700" : "bg-neutral-800")}>
              {m.content}
            </span>
          </div>
        ))}
        {busy && <p className="text-neutral-500">{name} is typing...</p>}
        {err && <p className="text-red-400">{err}</p>}
        <div ref={end} />
      </div>
      <div className="flex gap-2 border-t border-neutral-800 p-2">
        <input
          className="flex-1 rounded-lg bg-neutral-800 p-2 text-sm"
          placeholder="Type a message"
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send} disabled={busy} className="rounded-lg bg-purple-600 px-4 text-sm font-semibold disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  );
}
