import { Suspense } from "react";
import Link from "next/link";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export const metadata = {
  title: "Verify your email | Mystic Egypt",
};

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const email = typeof sp?.email === "string" ? sp.email : "";

  return (
    <Suspense>
      {email ? (
        <VerifyEmailForm email={email} />
      ) : (
        <p className="text-center text-muted-foreground">No email provided. Please <Link className="font-medium text-primary hover:underline" href={`/${locale}/forgot-password`}>request a code</Link>.</p>
      )}
    </Suspense>
  );
}
