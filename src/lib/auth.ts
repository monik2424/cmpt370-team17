import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/modules/db";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  // Note: Cannot use adapter with Credentials provider in NextAuth v5
  // adapter: PrismaAdapter(db),
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" } // "user" or "provider"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.loginType) {
          return null;
        }

        const loginType = credentials.loginType as string;
        if (loginType !== 'user' && loginType !== 'provider') {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string
          },
          include: {
            provider: true // Check if provider record exists
          }
        });

        if (!user || !user.password) {
          return null;
        }

        // Validate login type
        if (loginType === 'provider') {
          // If logging in as provider, user must have a provider record
          if (!user.provider) {
            return null; // User doesn't have provider account
          }
        } else if (loginType === 'user') {
          // User login - can login regardless of provider status
          // (A user can be both user and provider, but chooses how to login)
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          loginType: loginType,
          isProvider: !!user.provider
        };
      }
    })
  ],
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
        token.id = user.id;
        token.role = (user as any).role;
        token.loginType = (user as any).loginType;
        token.isProvider = (user as any).isProvider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).loginType = token.loginType;
        (session.user as any).isProvider = token.isProvider;

      }
      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
