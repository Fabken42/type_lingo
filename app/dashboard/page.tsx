import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <DashboardClient userName={session.user.name ?? ""} />
    </div>
  );
}
