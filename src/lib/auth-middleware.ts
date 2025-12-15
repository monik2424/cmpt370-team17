import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

// Lightweight config for middleware - no providers, no db, no bcrypt
// This only checks existing sessions, doesn't authenticate
export const middlewareAuthConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [], // Empty array - middleware doesn't need providers, only session checking
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id;
        token.role = (user as { role?: string }).role;
        token.loginType = (user as { loginType?: string }).loginType;
        token.isProvider = (user as { isProvider?: boolean }).isProvider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { loginType?: string }).loginType = token.loginType as string;
        (session.user as { isProvider?: boolean }).isProvider = token.isProvider as boolean;
      }
      return session;
    }
  }
};

export const { auth: middlewareAuth } = NextAuth(middlewareAuthConfig);

