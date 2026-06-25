"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Play, FileText } from "lucide-react";
import toast from "react-hot-toast";
import ProgressBar from "./ProgressBar";

interface FileCardProps {
  id: string;
  fileName: string;
  originalName: string;
  totalLines: number;
  currentLine?: number;
  createdAt: string;
  onDeleted: (id: string) => void;
}

export default function FileCard({
  id,
  fileName,
  originalName,
  totalLines,
  currentLine = 0,
  createdAt,
  onDeleted,
}: FileCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const progressPercent = totalLines > 0 ? (currentLine / totalLines) * 100 : 0;
  const dateLabel = new Date(createdAt).toLocaleDateString("pt-BR");

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      toast(
        (t) => (
          <span className="flex items-center gap-3 text-sm">
            Deletar &quot;{fileName}&quot;?
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold"
              onClick={async () => {
                toast.dismiss(t.id);
                await doDelete();
              }}
            >
              Confirmar
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
              onClick={() => {
                toast.dismiss(t.id);
                setConfirmDelete(false);
              }}
            >
              Cancelar
            </button>
          </span>
        ),
        { duration: 8000 }
      );
      return;
    }
    await doDelete();
  }

  async function doDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/subtitles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`"${fileName}" deletado`);
      onDeleted(id);
    } catch {
      toast.error("Erro ao deletar arquivo");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={18} className="text-gray-500 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-100 truncate" title={fileName}>
              {fileName}
            </p>
            <p className="text-xs text-gray-500 truncate">{originalName}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Deletar arquivo"
          className="shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-400">
          <span>
            Linha {currentLine} de {totalLines}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <ProgressBar value={progressPercent} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{dateLabel}</span>
        <button
          onClick={() => router.push(`/practice/${id}`)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Play size={14} />
          {currentLine > 0 ? "Continuar" : "Iniciar"}
        </button>
      </div>
    </div>
  );
}
