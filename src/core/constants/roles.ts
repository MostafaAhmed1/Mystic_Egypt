// Centralized user role constants (mirrors Prisma Role enum).
export const ROLES = {
  CLIENT: "CLIENT",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
