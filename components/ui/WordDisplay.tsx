"use client";

import React from "react";

interface WordDisplayProps {
  word: string;
  status: "pending" | "current" | "correct" | "incorrect";
  typed: string;
}

const WordDisplay = React.memo(function WordDisplay({ word, status, typed }: WordDisplayProps) {
  if (status === "correct") {
    return <span className="text-emerald-400">{word}</span>;
  }

  if (status === "incorrect") {
    return <span className="text-red-400 line-through">{word}</span>;
  }

  if (status === "current") {
    const chars = word.split("");
    return (
      <span className="relative inline-block rounded px-0.5 bg-blue-500/20 border-b-2 border-blue-400">
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
        {/* Extra characters typed beyond the word length */}
        {typed.length > word.length && (
          <span className="text-red-400">{typed.slice(word.length)}</span>
        )}
      </span>
    );
  }

  // pending
  return <span className="text-gray-500">{word}</span>;
});

export default WordDisplay;
