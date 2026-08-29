import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Sign in | Mystic Egypt",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
