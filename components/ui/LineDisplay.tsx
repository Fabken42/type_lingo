"use client";

import { Copy } from "lucide-react";
import toast from "react-hot-toast";

interface LineDisplayProps {
  lineText: string;
  typed: string;
}

export default function LineDisplay({ lineText, typed }: LineDisplayProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(lineText);
      toast.success("Texto copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  const chars = lineText.split("");

  return (
    <div
      className="group relative cursor-pointer select-none"
      onClick={handleCopy}
      title="Clique para copiar"
    >
      <div className="font-mono text-2xl leading-relaxed">
        {chars.map((char, i) => {
          const typedChar = typed[i];
          let cls = "text-gray-400";
          if (typedChar !== undefined) {
            cls = typedChar === char ? "text-emerald-400" : "text-red-400";
          }
          return (
            <span key={i} className={cls}>
              {char}
            </span>
          );
        })}
        {typed.length > lineText.length && (
          <span className="text-red-400">{typed.slice(lineText.length)}</span>
        )}
      </div>
      <span className="absolute -right-7 top-1 opacity-0 group-hover:opacity-50 transition-opacity">
        <Copy size={15} className="text-gray-500" />
      </span>
    </div>
  );
}
