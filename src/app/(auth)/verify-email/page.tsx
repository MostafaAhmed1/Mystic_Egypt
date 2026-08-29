import { Suspense } from "react";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export const metadata = {
  title: "Verify your email | Mystic Egypt",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email : "";

  return (
    <Suspense>
      {email ? (
        <VerifyEmailForm email={email} />
      ) : (
        <p className="text-center text-muted-foreground">No email provided. Please <a className="font-medium text-primary hover:underline" href="/forgot-password">request a code</a>.</p>
      )}
    </Suspense>
  );
}
