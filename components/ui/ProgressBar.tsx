"use client";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
}

export default function ProgressBar({ value, className = "" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`h-1.5 w-full rounded-full bg-gray-800 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
