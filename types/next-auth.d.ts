import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Retornado por `useSession`, `getSession` e recebido como prop no `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** O ID do usuário no banco de dados. */
      id: string;
    } & DefaultSession["user"]; // Preserva as propriedades originais (name, email, image)
  }
}