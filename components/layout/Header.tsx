"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, LayoutDashboard, Keyboard } from "lucide-react";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-gray-950/80 backdrop-blur border-b border-gray-800">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors"
        aria-label="Ir para dashboard"
      >
        <Keyboard size={22} className="text-blue-400" />
        <span className="font-bold text-lg tracking-tight hidden sm:block">TypeLingo</span>
      </button>

      {title && (
        <p className="text-gray-400 text-sm font-medium truncate max-w-xs hidden md:block">
          {title}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Dashboard"
        >
          <LayoutDashboard size={16} />
          <span className="hidden sm:block">Dashboard</span>
        </button>

        {session?.user && (
          <div className="flex items-center gap-2">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "Avatar"}
                width={28}
                height={28}
                className="rounded-full ring-1 ring-gray-700"
              />
            )}
            <span className="text-xs text-gray-400 hidden sm:block max-w-[120px] truncate">
              {session.user.name}
            </span>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
          aria-label="Sair"
        >
          <LogOut size={15} />
          <span className="hidden sm:block">Sair</span>
        </button>
      </div>
    </header>
  );
}
