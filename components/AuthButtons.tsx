// Arquivo: components/AuthButtons.tsx

"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export const AuthButtons = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-10 w-24 animate-pulse bg-slate-700 rounded-md" />;
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sky-400 hidden sm:block">{session.user?.name}</p>
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
    >
      Entrar com GitHub
    </button>
  );
};