import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/core/lib/prisma";

const TWO_FACTOR_SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.password_hash) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );

        if (!passwordValid) {
          return null;
        }

        const has2FA = user.is_2fa_verified && Boolean(user.totp_secret);

        if (has2FA) {
          // Check if there's a recently verified 2FA session
          const recentSession = await prisma.twoFactorSession.findFirst({
            where: {
              user_id: user.id,
              verified: true,
              expires_at: { gt: new Date() },
            },
            orderBy: { created_at: "desc" },
          });

          if (recentSession) {
            // 2FA was recently verified — clean up and allow login
            await prisma.twoFactorSession.delete({ where: { id: recentSession.id } });
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              email_verified: user.email_verified,
              requires_2fa: false,
            };
          }

          // 2FA enabled but not verified in this session
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            email_verified: user.email_verified,
            requires_2fa: true,
          };
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          email_verified: user.email_verified,
          requires_2fa: false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email_verified = user.email_verified;
        token.requires_2fa = (user as Record<string, unknown>).requires_2fa;
      }

      // Check if 2FA was verified (remove requires_2fa flag)
      if (token.requires_2fa && token.id) {
        const verifiedSession = await prisma.twoFactorSession.findFirst({
          where: {
            user_id: token.id as string,
            verified: true,
            expires_at: { gt: new Date() },
          },
        });

        if (verifiedSession) {
          // 2FA verified — clean up and remove flag
          await prisma.twoFactorSession.delete({ where: { id: verifiedSession.id } });
          token.requires_2fa = false;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email_verified = token.email_verified;
        session.user.requires_2fa = token.requires_2fa;
      }
      return session;
    },
  },
};
