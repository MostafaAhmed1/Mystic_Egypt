import type { Role } from "@/core/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      email_verified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    email_verified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    email_verified: boolean;
  }
}
