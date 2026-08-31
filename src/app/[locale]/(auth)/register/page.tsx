import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Create account | Mystic Egypt",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
