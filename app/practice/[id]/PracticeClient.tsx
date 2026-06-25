"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { SkipForward, SkipBack, RotateCcw, CheckCircle2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useDebounce } from "use-debounce";
import { usePracticeStore } from "@/store/practiceStore";
import LineDisplay from "@/components/ui/LineDisplay";
import ProgressBar from "@/components/ui/ProgressBar";

interface PracticeClientProps {
  subtitleId: string;
}

export default function PracticeClient({ subtitleId }: PracticeClientProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [inputValue, setInputValue] = useState("");

  const {
    lines,
    currentLineIndex,
    isComplete,
    totalLines,
    setLines,
    skipLine,
    goToLine,
    resetProgress,
    markComplete,
  } = usePracticeStore();

  const [debouncedLineIndex] = useDebounce(currentLineIndex, 2000);

  const saveProgress = useCallback(
    async (lineIdx: number) => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtitleFileId: subtitleId, currentLineIndex: lineIdx }),
        });
      } catch {
        // silent
      }
    },
    [subtitleId]
  );

  useEffect(() => {
    if (lines.length > 0) saveProgress(debouncedLineIndex);
  }, [debouncedLineIndex, saveProgress, lines.length]);

  useEffect(() => {
    function onUnload() {
      navigator.sendBeacon(
        "/api/progress",
        JSON.stringify({ subtitleFileId: subtitleId, currentLineIndex })
      );
    }
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [subtitleId, currentLineIndex]);

  // Load file + progress
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/subtitles/${subtitleId}`);
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Arquivo não encontrado");
            router.push("/dashboard");
            return;
          }
          throw new Error();
        }
        const { file, progress } = await res.json();
        setFileName(file.fileName);
        setLines(file.parsedLines, subtitleId);

        const startLine = progress?.currentLineIndex ?? 0;
        if (startLine > 0) {
          toast(`Continuando da linha ${startLine + 1}`, { icon: "📖" });
        }
        usePracticeStore.getState().goToLine(startLine);
      } catch {
        setError("Não foi possível carregar o arquivo.");
        toast.error("Erro ao carregar arquivo");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitleId]);

  // Focus input and clear it whenever line changes
  useEffect(() => {
    inputRef.current?.focus();
    if (inputRef.current) inputRef.current.value = "";
    setInputValue("");
  }, [currentLineIndex]);

  // ─── Input handling ────────────────────────────────────────────────────────
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleCompositionStart() {
    isComposingRef.current = true;
  }

  function handleCompositionEnd() {
    isComposingRef.current = false;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !isComposingRef.current) {
      e.preventDefault();
      advanceLine();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      doSkip();
    }
  }

  function advanceLine() {
    const next = currentLineIndex + 1;
    if (next >= totalLines) {
      markComplete();
      saveProgress(next);
    } else {
      goToLine(next);
      saveProgress(next);
    }
  }

  function doSkip() {
    skipLine();
    if (inputRef.current) inputRef.current.value = "";
    setInputValue("");
    toast("Linha pulada", { icon: "⏭", duration: 1500 });
    saveProgress(currentLineIndex + 1);
  }

  function handleBack() {
    const prev = currentLineIndex - 1;
    if (prev < 0) return;
    goToLine(prev);
    saveProgress(prev);
  }

  function handleJump() {
    const num = parseInt(jumpInput, 10);
    if (isNaN(num) || num < 1 || num > totalLines) {
      toast.error(`Número deve ser entre 1 e ${totalLines}`);
      return;
    }
    const idx = num - 1;
    goToLine(idx);
    saveProgress(idx);
    setJumpInput("");
  }

  function handleRestart() {
    resetProgress();
    saveProgress(0);
  }

  // ─── Derived values ────────────────────────────────────────────────────────
  const progressPercent = totalLines > 0 ? ((currentLineIndex + 1) / totalLines) * 100 : 0;
  const currentLine = lines[currentLineIndex];
  const nextLine = lines[currentLineIndex + 1] ?? null;

  // ─── Loading / error / complete states ────────────────────────────────────
  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-blue-400 hover:underline"
        >
          Voltar ao dashboard
        </button>
      </main>
    );
  }

  if (isComplete) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-6">
        <div className="p-5 rounded-2xl bg-emerald-500/10">
          <CheckCircle2 size={48} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Legenda concluída! 🎉</h2>
          <p className="text-gray-400">
            Você completou todas as {totalLines} linhas de &quot;{fileName}&quot;
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <RotateCcw size={15} /> Reiniciar
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </main>
    );
  }

  // ─── Main practice UI ─────────────────────────────────────────────────────
  return (
    <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-8 gap-6">
      {/* File name + progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium truncate">{fileName}</span>
          <span className="text-gray-500 shrink-0 ml-4">
            {currentLineIndex + 1} / {totalLines}
          </span>
        </div>
        <ProgressBar value={progressPercent} />
      </div>

      {/* Lines area */}
      <div className="flex flex-col gap-6">
        {/* Current line */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-600 mb-3 uppercase tracking-wider font-medium">
            Linha atual
          </p>
          {currentLine && (
            <LineDisplay lineText={currentLine.text} typed={inputValue} />
          )}
        </div>

        {/* Next line preview */}
        {nextLine && (
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
            <p className="text-xs text-gray-700 mb-3 uppercase tracking-wider font-medium">
              Próxima linha
            </p>
            <p className="font-mono text-lg text-gray-600 leading-relaxed">
              {nextLine.text}
            </p>
          </div>
        )}
      </div>

      {/* Visible input */}
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          defaultValue=""
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Digite aqui… (Enter para avançar)"
          className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-3 font-mono text-gray-100 text-base placeholder-gray-600 outline-none transition-colors"
          aria-label="Campo de digitação"
        />
        <p className="text-xs text-gray-700 text-center">
          Clique na linha para copiar &bull; Enter avança &bull; Esc pula linha
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            disabled={currentLineIndex === 0}
            aria-label="Linha anterior"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 disabled:opacity-30 transition-colors"
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={doSkip}
            aria-label="Pular linha"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 transition-colors"
          >
            <SkipForward size={18} />
          </button>
          <button
            onClick={handleRestart}
            aria-label="Reiniciar do início"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={totalLines}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJump()}
            placeholder={`1–${totalLines}`}
            className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            aria-label="Ir para linha"
          />
          <button
            onClick={handleJump}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            Ir
          </button>
        </div>
      </div>
    </main>
  );
}
