"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function UploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".srt")) {
      toast.error("Apenas arquivos .srt são suportados");
      return;
    }
    setSelectedFile(file);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao enviar arquivo");
        return;
      }

      toast.success("Arquivo enviado com sucesso!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Erro de rede ao enviar arquivo");
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  }, [router]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4 cursor-pointer
        rounded-2xl border-2 border-dashed p-16 transition-all duration-200
        ${dragging
          ? "border-blue-500 bg-blue-500/10"
          : "border-gray-700 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/50"
        }
        ${uploading ? "pointer-events-none opacity-70" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".srt"
        className="hidden"
        onChange={onInputChange}
      />

      {uploading ? (
        <>
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 font-medium">
            Enviando {selectedFile?.name}…
          </p>
        </>
      ) : (
        <>
          <div className="p-4 rounded-2xl bg-gray-800">
            <UploadCloud
              size={36}
              className={dragging ? "text-blue-400" : "text-gray-400"}
            />
          </div>
          <div className="text-center">
            <p className="text-gray-200 font-semibold text-lg">
              Arraste seu arquivo .srt aqui
            </p>
            <p className="text-gray-500 text-sm mt-1">
              ou clique para selecionar &mdash; máx. 5 MB
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FileText size={14} />
            <span>Suporte a UTF-8, legendas com tags HTML/ASS</span>
          </div>
        </>
      )}
    </div>
  );
}
