// Arquivo: app/api/auth/[...nextauth]/route.ts (VERSÃO CORRETA E COMPLETA)

import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Exporte as opções para que outros arquivos (nossas APIs de tasks) possam importá-las
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  // ESTA PARTE É CRUCIAL PARA O FUNCIONAMENTO DA API
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        // Adiciona o ID do usuário da base de dados ao objeto da sessão
        session.user.id = user.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };