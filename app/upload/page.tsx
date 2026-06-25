import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import UploadZone from "@/components/ui/UploadZone";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Upload de Legenda</h1>
        <p className="text-gray-500 text-sm mb-8">
          Envie um arquivo .srt para criar um novo exercício de digitação.
        </p>
        <UploadZone />
      </main>
    </div>
  );
}
