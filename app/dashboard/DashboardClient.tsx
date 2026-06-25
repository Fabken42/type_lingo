"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText } from "lucide-react";
import toast from "react-hot-toast";
import FileCard from "@/components/ui/FileCard";

interface FileItem {
  _id: string;
  fileName: string;
  originalName: string;
  totalLines: number;
  createdAt: string;
  progress?: { currentLineIndex: number } | null;
}

interface DashboardClientProps {
  userName: string;
}

export default function DashboardClient({ userName }: DashboardClientProps) {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subtitles");
      if (!res.ok) throw new Error("Erro ao carregar arquivos");
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch {
      setError("Não foi possível carregar seus arquivos.");
      toast.error("Erro ao carregar arquivos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  function handleDeleted(id: string) {
    setFiles((prev) => prev.filter((f) => f._id !== id));
  }

  const firstName = userName.split(" ")[0];

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Olá, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {files.length > 0
              ? `${files.length} arquivo${files.length > 1 ? "s" : ""} de legenda`
              : "Nenhum arquivo ainda"}
          </p>
        </div>
        <button
          onClick={() => router.push("/upload")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Upload size={16} />
          Upload .srt
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-48 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchFiles}
            className="text-sm text-blue-400 hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-5 rounded-2xl bg-gray-900">
            <FileText size={40} className="text-gray-700" />
          </div>
          <p className="text-gray-400 font-medium">Nenhum arquivo enviado ainda</p>
          <p className="text-gray-600 text-sm">
            Faça upload de um arquivo .srt para começar a praticar
          </p>
          <button
            onClick={() => router.push("/upload")}
            className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Enviar primeiro arquivo
          </button>
        </div>
      )}

      {!loading && !error && files.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <FileCard
              key={file._id}
              id={file._id}
              fileName={file.fileName}
              originalName={file.originalName}
              totalLines={file.totalLines}
              currentLine={file.progress?.currentLineIndex ?? 0}
              createdAt={file.createdAt}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </main>
  );
}
