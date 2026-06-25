import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import PracticeClient from "./PracticeClient";

interface PageProps {
  params: { id: string };
}

export default async function PracticePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <PracticeClient subtitleId={params.id} />
    </div>
  );
}
